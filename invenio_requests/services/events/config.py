# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Request Events Service Config."""

from invenio_records_resources.services import (
    Link,
    RecordServiceConfig,
    ServiceSchemaWrapper,
)
from invenio_records_resources.services.base.config import ConfiguratorMixin, FromConfig
from invenio_records_resources.services.records.links import pagination_links
from invenio_records_resources.services.records.results import RecordItem, RecordList

from invenio_requests.proxies import (
    current_request_type_registry,
)

from ...records.api import Request, RequestEvent
from ..permissions import PermissionPolicy
from ..schemas import RequestEventSchema


class RequestEventItem(RecordItem):
    """RequestEvent result item."""

    @property
    def id(self):
        """Id property."""
        return self._record.id


class RequestEventList(RecordList):
    """RequestEvent result item."""

    def to_dict(self):
        """Return result as a dictionary."""
        # TODO: This part should imitate the result item above. I.e. add a
        # "data" property which uses a ServiceSchema to dump the entire object.
        hits = list(self.hits)

        if self._expand and self._fields_resolver:
            self._fields_resolver.resolve(self._identity, hits)

        for hit in hits:
            if self._expand and self._fields_resolver:
                # Expand the hit itself
                fields = self._fields_resolver.expand(self._identity, hit)
                hit["expanded"] = fields

            for child in hit.get("children_preview", []):
                # Load dump
                record = self._service.record_cls.loads(child)

                # Project the record
                projection = self._schema.dump(
                    record,
                    context=dict(
                        identity=self._identity,
                        record=record,
                    ),
                )
                if self._links_item_tpl:
                    projection["links"] = self._links_item_tpl.expand(
                        self._identity, record
                    )
                child.update(projection)

                if self._expand and self._fields_resolver:
                    # Expand the child
                    child_fields = self._fields_resolver.expand(self._identity, child)
                    child["expanded"] = child_fields

        res = {
            "hits": {
                "hits": hits,
                "total": self.total,
            }
        }

        if self.aggregations:
            res["aggregations"] = self.aggregations

        if self._params:
            res["sortBy"] = self._params["sort"]
            if self._links_tpl:
                res["links"] = self._links_tpl.expand(self._identity, self.pagination)

        return res

    @property
    def hits(self):
        """Iterator over the hits."""
        for hit in self._results:
            # Load dump
            record = self._service.record_cls.loads(hit.to_dict())

            # Project the record
            schema = ServiceSchemaWrapper(
                self._service, record.type.marshmallow_schema()
            )
            projection = schema.dump(
                record,
                context=dict(
                    identity=self._identity,
                    record=record,
                    meta=hit.meta,
                ),
            )

            if self._links_item_tpl:
                projection["links"] = self._links_item_tpl.expand(
                    self._identity, record
                )

            yield projection


class RequestEventLink(Link):
    """Link variables setter for RequestEvent links."""

    @staticmethod
    def vars(obj, vars):
        """Variables for the URI template."""
        request_type = current_request_type_registry.lookup(vars["request_type"])
        vars.update({"id": obj.id, "request_id": obj.request_id})
        vars.update(request_type._update_link_config(**vars))


class RequestEventsServiceConfig(RecordServiceConfig, ConfiguratorMixin):
    """Config."""

    service_id = "request_events"

    request_cls = Request
    permission_policy_cls = FromConfig(
        "REQUESTS_PERMISSION_POLICY", default=PermissionPolicy
    )
    schema = RequestEventSchema
    record_cls = RequestEvent
    result_item_cls = RequestEventItem
    result_list_cls = RequestEventList
    indexer_queue_name = "events"

    # ResultItem configurations
    links_item = {
        "self": RequestEventLink("{+api}/requests/{request_id}/comments/{id}"),
        "self_html": RequestEventLink("{+ui}/requests/{request_id}#commentevent-{id}"),
    }
    links_search = pagination_links("{+api}/requests/{request_id}/timeline{?args*}")

    components = FromConfig(
        "REQUESTS_EVENTS_SERVICE_COMPONENTS",
        default=[],
    )

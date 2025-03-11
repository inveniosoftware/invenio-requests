# -*- coding: utf-8 -*-
#
# Copyright (C) 2021-2022 CERN.
# Copyright (C) 2021-2022 Northwestern University.
# Copyright (C) 2021-2022 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Results for the requests service."""

from invenio_records_resources.services.records.results import (
    FieldsResolver,
    RecordItem,
    RecordList,
)


### TODO: move this ###
from invenio_records.dictutils import dict_lookup, dict_merge, dict_set


class MultiFieldsResolver:
    """Resolve the reference record for each of the configured fields.

    Given a list of fields referencing other records/objects,
    it fetches and returns the dereferenced record/obj.

    This class supports resolution of nested fields and efficiently batches
    resolution requests to services.
    """

    def __init__(self, expandable_fields):
        """Constructor.

        :params expandable_fields: list of ExpandableField objects.
        """
        self._fields = expandable_fields

    def _collect_values(self, hits):
        """Collect all field values to be expanded."""
        grouped_values = dict()

        for hit in hits:
            for field in self._fields:
                try:
                    value = dict_lookup(hit, field.field_name)
                    if value is None:
                        continue
                except KeyError:
                    continue

                # Ensure `get_value_service` can return multiple (v, service) tuples
                values_services = field.get_value_service(value)

                if not isinstance(values_services, list):
                    values_services = [values_services]  # Ensure list format

                for v, service in values_services:
                    field.add_service_value(service, v)
                    grouped_values.setdefault(service, set()).add(v)

        return grouped_values

    def _find_fields(self, service, value):
        """Find all fields matching the given service and value."""
        return [field for field in self._fields if field.has(service, value)]

    def _fetch_referenced(self, grouped_values, identity):
        """Fetch referenced records in bulk and store resolved records."""

        def _add_dereferenced_record(service, value, resolved_rec):
            """Helper to set the dereferenced record in each matching field."""
            for field in self._find_fields(service, value):
                field.add_dereferenced_record(service, value, resolved_rec)

        for service, all_values in grouped_values.items():
            results = service.read_many(identity, list(all_values))

            found_values = set()
            for hit in results.hits:
                value = hit.get("id", None)
                found_values.add(value)
                _add_dereferenced_record(service, value, hit)

            ghost_values = all_values - found_values
            for value in ghost_values:
                _add_dereferenced_record(service, value, None)

    def resolve(self, identity, hits):
        """Collect field values and resolve referenced records."""
        _hits = list(hits)  # Ensure it is a list
        grouped_values = self._collect_values(_hits)
        self._fetch_referenced(grouped_values, identity)

    def expand(self, identity, hit):
        """Expand and return the resolved fields for the given hit."""
        results = {}

        for field in self._fields:
            try:
                value = dict_lookup(hit, field.field_name)
                if value is None:
                    continue
            except KeyError:
                continue

            # Ensure `get_value_service` supports lists of (value, service)
            values_services = field.get_value_service(value)
            resolved_recs = {}
            if isinstance(values_services, list):
                resolved_recs = []
                for v, service in values_services:
                    resolved_rec = field.get_dereferenced_record(service, v)
                    if resolved_rec:
                        resolved = field.pick(identity, resolved_rec)
                        if isinstance(resolved, list):
                            resolved_recs.extend(resolved)
                        else:
                            resolved_recs.append(field.pick(identity, resolved_rec))
            else:
                v, service = values_services
                resolved_rec = field.get_dereferenced_record(service, v)
                if resolved_rec:
                    resolved_recs = field.pick(identity, resolved_rec)
            if resolved_recs:
                # Maintain nested structure
                d = dict()
                dict_set(d, field.field_name, resolved_recs)
                dict_merge(results, d)

        return results


class RequestItem(RecordItem):
    """Single request result."""

    def __init__(
        self,
        service,
        identity,
        request,
        errors=None,
        links_tpl=None,
        schema=None,
        expandable_fields=None,
        expand=False,
    ):
        """Constructor."""
        self._data = None
        self._errors = errors
        self._identity = identity
        self._request = request
        self._record = request
        self._service = service
        self._links_tpl = links_tpl
        self._schema = schema or service._wrap_schema(request.type.marshmallow_schema())
        self._fields_resolver = MultiFieldsResolver(expandable_fields)
        self._expand = expand

    @property
    def id(self):
        """Identity of the request."""
        return str(self._request.id)

    def __getitem__(self, key):
        """Key a key from the data."""
        return self.data[key]

    @property
    def links(self):
        """Get links for this result item."""
        return self._links_tpl.expand(self._identity, self._request)

    @links.setter
    def links_tpl(self, links_tpl):
        """Set links template for this result item."""
        self._links_tpl = links_tpl

    @property
    def _obj(self):
        """Return the object to dump."""
        return self._request

    @property
    def data(self):
        """Property to get the request."""
        if self._data:
            return self._data

        self._data = self._schema.dump(
            self._obj,
            context={
                "identity": self._identity,
                "record": self._request,
            },
        )

        if self._links_tpl:
            self._data["links"] = self.links

        if self._expand and self._fields_resolver:
            self._fields_resolver.resolve(self._identity, [self._data])
            fields = self._fields_resolver.expand(self._identity, self._data)
            self._data["expanded"] = fields

        return self._data

    @property
    def errors(self):
        """Get the errors."""
        return self._errors

    def to_dict(self):
        """Get a dictionary for the request."""
        res = self.data
        if self._errors:
            res["errors"] = self._errors
        return res


class RequestList(RecordList):
    """List of request results."""

    def __init__(
        self,
        service,
        identity,
        results,
        params=None,
        links_tpl=None,
        links_item_tpl=None,
        expandable_fields=None,
        expand=False,
    ):
        """Constructor.

        :params service: a service instance
        :params identity: an identity that performed the service request
        :params results: the search results
        :params params: dictionary of the query parameters
        """
        self._identity = identity
        self._results = results
        self._service = service
        self._params = params
        self._links_tpl = links_tpl
        self._links_item_tpl = links_item_tpl
        self._fields_resolver = MultiFieldsResolver(expandable_fields)
        self._expand = expand

    @property
    def hits(self):
        """Iterator over the hits."""
        request_cls = self._service.record_cls

        for hit in self._results:
            # load dump
            request = request_cls.loads(hit.to_dict())
            schema = self._service._wrap_schema(request.type.marshmallow_schema())

            # project the request
            projection = schema.dump(
                request,
                context={
                    "identity": self._identity,
                    "record": request,
                },
            )

            if self._links_item_tpl:
                projection["links"] = self._links_item_tpl.expand(
                    self._identity, request
                )

            yield projection

    def to_dict(self):
        """Return result as a dictionary."""
        # TODO: This part should imitate the result item above. I.e. add a
        # "data" property which uses a ServiceSchema to dump the entire object.
        hits = list(self.hits)

        if self._expand and self._fields_resolver:
            self._fields_resolver.resolve(self._identity, hits)
            for hit in hits:
                fields = self._fields_resolver.expand(self._identity, hit)
                hit["expanded"] = fields

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

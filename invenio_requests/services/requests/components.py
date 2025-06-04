# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Component for creating request numbers."""

from flask import current_app
from invenio_i18n import _
from invenio_records_resources.services.records.components import (
    DataComponent,
    ServiceComponent,
)

from invenio_requests.customizations.event_types import LogEventType
from invenio_requests.proxies import current_events_service


class RequestNumberComponent(ServiceComponent):
    """Component for assigning request numbers to new requests."""

    def create(self, identity, data=None, record=None, **kwargs):
        """Create identifier when record is created."""
        type(record).number.assign(record)


class EntityReferencesComponent(ServiceComponent):
    """Component for initializing a request's entity references."""

    def create(self, identity, data=None, record=None, **kwargs):
        """Initialize the entity reference fields of a request."""
        for field in ("created_by", "receiver", "topic"):
            if field in kwargs:
                setattr(record, field, kwargs[field])


class RequestDataComponent(DataComponent):
    """Request variant of DataComponent using dynamic schema."""

    def update(self, identity, data=None, record=None, **kwargs):
        """Update an existing record (request)."""
        if record.status == "created":
            keys = ("title", "description", "payload", "receiver", "topic")
        else:
            keys = ("title", "description")

        for k in keys:
            if k in data:
                record[k] = data[k]


class RequestReviewersComponent(ServiceComponent):
    """Component for handling request reviewers."""

    def update(self, identity, data=None, record=None, **kwargs):
        """Update the reviewers of a request."""
        if "reviewers" in data:
            if current_app.config.get("REQUESTS_REVIEWERS_ENABLED") is False:
                raise ValueError(_("Reviewers are not enabled for this request type."))
            if current_app.config.get("REQUESTS_ENABLE_GROUP_REVIEWERS") is False:
                # Ensure that reviewers are not groups
                for reviewer in data["reviewers"]:
                    if "group" in reviewer:
                        raise ValueError(_("Group reviewers are not enabled."))

            # Update the reviewers list
            record["reviewers"] = data["reviewers"]

            # Create an event for the change
            # TODO Add event based on reviewers added/removed
            event = LogEventType(
                payload=dict(
                    event="reviewers_changed",
                    content=_("updated reviewers"),
                )
            )
            _data = dict(payload=event.payload)
            current_events_service.create(
                identity, record.id, _data, event, uow=self.uow
            )


class RequestPayloadComponent(DataComponent):
    """Request variant of DataComponent using dynamic schema."""

    def update(self, identity, data=None, record=None, **kwargs):
        """Update an existing request payload based on permissions."""
        payload = {}
        # take permissions if exist
        permissions = getattr(
            record.type.payload_schema_cls, "field_load_permissions", {}
        )
        if permissions:
            for key in data["payload"]:
                if key in permissions:
                    # permissions should have been checked by now already
                    # so we can assign the new data
                    payload[key] = data["payload"][key]
                else:
                    # keep the old data - no permission to change it
                    # workaround for the lack of patch method
                    payload[key] = record["payload"][key]
            record["payload"] = payload

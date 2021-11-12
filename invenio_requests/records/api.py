# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""API classes for requests in Invenio."""

from collections import namedtuple
from datetime import datetime
from enum import Enum

import pytz
from invenio_records.dumpers import ElasticsearchDumper
from invenio_records.systemfields import ConstantField, DictField, ModelField
from invenio_records_resources.records.api import Record
from invenio_records_resources.records.systemfields import IndexField

from .actions import AcceptAction, CancelAction, DeclineAction, ExpireAction
from .dumpers import CalculatedFieldDumperExt
from .models import RequestEventModel, RequestMetadata
from .schema import RequestSchema
from .systemfields import IdentityField, OpenStateCalculatedField, RequestStatusField


class Request(Record):
    """A generic request record."""

    model_cls = RequestMetadata

    dumper = ElasticsearchDumper(
        extensions=[
            CalculatedFieldDumperExt("is_open"),
            CalculatedFieldDumperExt("is_expired"),
        ]
    )

    id = IdentityField("external_id")

    metadata = None
    """Disabled metadata field from the base class."""

    # TODO figure out aliases, multiple mappings, common search fields
    index = IndexField("requests-request-v1.0.0", search_alias="requests")

    schema = ConstantField("$schema", "local://requests/request-v1.0.0.json")

    request_type = ConstantField("request_type", "Generic Request")
    """The human-readable request type.

    To be overridden in subclasses with unique values, as this is used
    in the RequestsService to choose the correct API class to use for a
    request.
    """

    marshmallow_schema = RequestSchema
    """Schema used for de/serialization of requests of this type.

    To be overridden in subclasses, if the custom request type follows a
    different or more specific schema.
    """

    status = RequestStatusField("status")
    """The current status of the request."""

    available_statuses = {
        "draft": True,
        "open": True,
        "cancelled": False,
        "declined": False,
        "accepted": False,
        "expired": False,
    }
    """Available statuses for the Request.

    The keys in this dictionary is the set of available statuses, and their
    values are indicators whether this Request is still considered to be
    "open" in this state.
    """

    available_actions = {
        "accept": AcceptAction,
        "cancel": CancelAction,
        "decline": DeclineAction,
        "expire": ExpireAction,
    }
    """Available actions for this Request.

    The keys are the internal identifiers for the actions, the values are
    the actual RequestAction classes (not objects).
    Whenever an action is looked up, a new object of the registered
    RequestAction class is instantiated with the current Request object as
    argument.
    """

    is_open = OpenStateCalculatedField("is_open")

    expires_at = ModelField("expires_at")

    @property
    def is_expired(self):
        """Check if the Request is expired."""
        if self.expires_at is None:
            return False

        # comparing timezone-aware and naive datetimes results in an error
        # https://docs.python.org/3/library/datetime.html#determining-if-an-object-is-aware-or-naive # noqa
        now = datetime.utcnow()
        d = self.expires_at
        if d.tzinfo and d.tzinfo.utcoffset(d) is not None:
            now = now.replace(tzinfo=pytz.utc)

        return d < now

    def get_action(self, action_name):
        return self.available_actions[action_name](self)

    def can_execute_action(self, action_name, identity):
        return self.get_action(action_name).can_execute(identity)

    def execute_action(self, action_name, identity):
        return self.get_action(action_name).execute(identity)


class RequestEventType(Enum):
    """Request Event type enum."""

    COMMENT = "C"
    DELETED_COMMENT = "D"


class RequestEventFormat(Enum):
    """Comment/content format enum."""

    HTML = "html"


FakePID = namedtuple("FakePID", ["pid_value"])
"""PID workaround."""


class RequestEvent(Record):
    """A Request Event."""

    model_cls = RequestEventModel

    # Systemfields
    metadata = None

    request = ModelField(dump=False)
    """The request."""

    type = ModelField("type")
    """The human-readable event type."""

    index = IndexField("request_events-event-v1.0.0", search_alias="request_events")
    """The ES index used."""

    id = ModelField("id")
    """The data-layer id."""

    created_by = DictField("created_by")
    """Who created the event."""

    @property
    def pid(self):
        """Fake pid interface to comply with the RecordLink interface."""
        return FakePID(self.id)

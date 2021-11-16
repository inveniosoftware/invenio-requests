# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Base class for creating custom types of requests.

The `RequestType` classes are the most important part in the customization/extension
mechanism for custom types of requests.
TODO explain what can be done here, and how!
"""


from uuid import uuid4

from .actions import (
    AcceptAction,
    CancelAction,
    DeclineAction,
    ExpireAction,
    SubmitAction,
)
from .schema import RequestSchema


class RequestType:
    type_id = "invenio-requests.request"
    name = "Generic Request"

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
        "submit": SubmitAction,
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

    marshmallow_schema = RequestSchema
    """Schema used for de/serialization of requests of this type.

    To be overridden in subclasses, if the custom request type follows a
    different or more specific schema.
    """

    def generate_external_id(self, request, **kwargs):
        """Generate a new external identifier.

        This method can be overridden in subclasses to create external identifiers
        according to a custom schema, using the information associated with the request
        (e.g. subject, receiver, creator).
        """
        return str(uuid4())

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<RequestType '{self.name}'>"

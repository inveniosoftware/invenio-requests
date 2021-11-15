# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

from .actions import AcceptAction, CancelAction, DeclineAction, ExpireAction
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

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<RequestType '{self.name}'>"

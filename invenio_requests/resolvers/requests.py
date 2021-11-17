# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Resolver for requests."""

from ..records.api import Request
from .base import EntityResolver


class RequestResolver(EntityResolver):
    """Resolver for request entities."""

    ENTITY_TYPE_KEY = "request"
    ENTITY_TYPE_CLASS = Request

    def __init__(self, request_cls=None):
        """Create a new request resolver for the given request_cls."""
        self.request_cls = request_cls or Request

    def do_resolve(self, reference_dict):
        """Resolve the request_cls from the given reference_dict."""
        id_ = self._get_id(reference_dict)
        return self.request_cls.get_record(id_)

# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Resolver for records."""

from .base import EntityResolver


class RecordResolver(EntityResolver):
    """Resolver for record entities."""

    ENTITY_TYPE_KEY = "record"
    ENTITY_TYPE_CLASS = None

    def __init__(self, record_cls):
        """Create a new record resolver for the given record_cls."""
        self.record_cls = record_cls

    def do_resolve(self, reference_dict):
        """Resolve the record_cls from the given reference_dict."""
        pid_value = self._get_id(reference_dict)
        return self.record_cls.pid.resolve(pid_value)

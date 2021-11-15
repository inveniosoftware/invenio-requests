# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Systemfield for managing referenced entities in request."""

from invenio_records.systemfields import SystemField

from ...resolvers.helpers import reference_entity, resolve_entity


class ReferencedEntityField(SystemField):
    """Systemfield for managing the request type."""

    def set_obj(self, instance, obj):
        """Set the request type."""
        if not isinstance(obj, dict):
            obj = reference_entity(obj, raise_=True)

        # set dictionary key and reset the cache
        self.set_dictkey(instance, obj)
        self._set_cache(instance, None)

    def __set__(self, record, value):
        """Set the request type."""
        assert record is not None
        self.set_obj(record, value)

    def obj(self, instance):
        """Get the request type."""
        obj = self._get_cache(instance)
        if obj is not None:
            return obj

        reference_dict = self.get_dictkey(instance)

        # TODO do not automatically use a DB lookup!
        obj = resolve_entity(reference_dict)
        self._set_cache(instance, obj)
        return obj

    def __get__(self, record, owner=None):
        """Get the request type."""
        if record is None:
            # access by class
            return self

        return self.obj(record)

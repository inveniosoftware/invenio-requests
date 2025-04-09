# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 - 2022 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Systemfield for managing referenced entities in request."""

from functools import partial

from invenio_records_resources.records.systemfields.entity_reference import (
    ReferencedEntityField,
    check_allowed_references,
)

from ...resolvers.registry import ResolverRegistry

EntityReferenceField = partial(
    ReferencedEntityField, resolver_registry=ResolverRegistry
)
"""An opinionated ReferenceEntityField with set ResolverRegistry."""

check_allowed_creators = partial(
    check_allowed_references,
    lambda r: r.type.creator_can_be_none,
    lambda r: r.type.allowed_creator_ref_types,
)
"""Check function specific for the ``created_by`` field of requests."""

check_allowed_receivers = partial(
    check_allowed_references,
    lambda r: r.type.receiver_can_be_none,
    lambda r: r.type.allowed_receiver_ref_types,
)
"""Check function specific for the ``receiver`` field of requests."""

check_allowed_topics = partial(
    check_allowed_references,
    lambda r: r.type.topic_can_be_none,
    lambda r: r.type.allowed_topic_ref_types,
)
"""Check function specific for the ``topic`` field of requests."""


#### TODO: move this ####
from invenio_records.systemfields import SystemField
from invenio_records_resources.references.entity_resolvers import EntityProxy


class MultiReferenceEntityField(SystemField):
    """System field for managing multiple referenced entities."""

    def __init__(self, key=None, reference_check_func=None, resolver_registry=None):
        """Constructor."""
        super().__init__(key=key)
        self._ref_check = reference_check_func
        self._registry = resolver_registry

    def _check_reference(self, instance, ref_dict):
        """Check if the reference is accepted."""
        if self._ref_check is None:
            return True
        return self._ref_check(instance, ref_dict)

    def set_obj(self, instance, objs):
        """Set multiple referenced entities."""
        references = []

        for obj in objs:
            if isinstance(obj, dict):
                ref_dict = obj
            elif isinstance(obj, EntityProxy):
                ref_dict = obj.reference_dict
            elif obj is not None:
                ref_dict = self._registry.reference_entity(obj, raise_=True)
            else:
                continue

            if not self._check_reference(instance, ref_dict):
                raise ValueError(f"Invalid reference for '{self.key}': {ref_dict}")

            references.append(ref_dict)

        self.set_dictkey(instance, references)
        self._set_cache(instance, None)

    def __set__(self, record, values):
        """Set multiple referenced entities."""
        assert record is not None
        self.set_obj(record, values)

    def obj(self, instance):
        """Get the referenced entities as a list of `EntityProxy` objects."""
        cached = self._get_cache(instance)
        if cached is not None:
            return cached

        references_list = self.get_dictkey(instance)
        if references_list is None:
            return []

        resolved_objects = [
            self._registry.resolve_entity_proxy(ref_dict)
            for ref_dict in references_list
        ]

        self._set_cache(instance, resolved_objects)
        return resolved_objects

    def __get__(self, record, owner=None):
        """Get the referenced entities as a list of `EntityProxy` objects."""
        if record is None:
            return self
        return self.obj(record)


check_allowed_reviewers = partial(
    check_allowed_references,
    lambda r: r.type.reviewers_can_be_none,
    lambda r: r.type.allowed_reviewers_ref_types,
)
"""Check function specific for the ``re`` field of requests."""


MultiEntityReferenceField = partial(
    MultiReferenceEntityField, resolver_registry=ResolverRegistry
)
"""An opinionated ReferenceEntityField with set ResolverRegistry."""

# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Request service results."""

from invenio_records_resources.services.records.results import ExpandableField

from ..resolvers.registry import ResolverRegistry


class EntityResolverExpandableField(ExpandableField):
    """Expandable entity resolver field.

    It will use the Entity resolver registry to retrieve the service to
    use to fetch records and the fields to return when serializing
    the referenced record.
    """

    entity_proxy = None

    def ghost_record(self, value):
        """Return ghost representation of not resolved value."""
        return self.entity_proxy.ghost_record(value)

    def system_record(self):
        """Return the representation of a system user."""
        return self.entity_proxy.system_record()

    def get_value_service(self, value):
        """Return the value and the service via entity resolvers."""
        self.entity_proxy = ResolverRegistry.resolve_entity_proxy(value)
        v = self.entity_proxy._parse_ref_dict_id()
        _resolver = self.entity_proxy.get_resolver()
        service = _resolver.get_service()
        return v, service

    def pick(self, identity, resolved_rec):
        """Pick fields defined in the entity resolver."""
        return self.entity_proxy.pick_resolved_fields(identity, resolved_rec)


### TODO: move this ###
class MultiEntityResolverExpandableField(ExpandableField):
    """Expandable entity resolver field for multiple references.

    It uses the Entity resolver registry to retrieve the service to
    use to fetch records and the fields to return when serializing
    the referenced records.
    """

    def __init__(self, key):
        """Initialize the field."""
        super().__init__(key)
        self.entity_proxies = []

    def ghost_record(self, values):
        """Return ghost representation for unresolved values."""
        return [
            ResolverRegistry.resolve_entity_proxy(value).ghost_record(value)
            for value in values
        ]

    def system_record(self):
        """Return the representation of a system user."""
        return [
            ResolverRegistry.resolve_entity_proxy(value).system_record()
            for value in self.get_cached_value()
        ]

    def get_value_service(self, values):
        """Return a list of (value, service) tuples for multiple references."""
        self.entity_proxies = [
            ResolverRegistry.resolve_entity_proxy(value) for value in values
        ]

        results = []
        for proxy in self.entity_proxies:
            ref_id = proxy._parse_ref_dict_id()
            resolver = proxy.get_resolver()
            service = resolver.get_service()
            results.append((ref_id, service))
        return results

    def pick(self, identity, resolved_record):
        """Pick fields from resolved records based on the entity resolver."""
        for proxy in self.entity_proxies:
            if proxy._parse_ref_dict_id() == resolved_record["id"]:
                return proxy.pick_resolved_fields(identity, resolved_record)

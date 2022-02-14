# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 - 2022 TU Wien.
# Copyright (C) 2022 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio module for generic and customizable requests."""

from invenio_records_resources.references.resolvers import UserResolver

from .services.requests import facets

REQUESTS_PERMISSION_POLICY = None
"""Deprecated. Override the default requests/comments permission policy."""

REQUESTS_REGISTERED_TYPES = []
"""Configuration for registered Request Types."""

REQUESTS_ENTITY_RESOLVERS = [
    UserResolver(),
]
"""Registered resolvers for resolving/creating references in request metadata."""

REQUESTS_ROUTES = {
    'details': '/requests/<pid_value>',
}
"""Invenio requests ui endpoints."""

REQUESTS_FACETS = {
    'type': {
        'facet': facets.type,
        'ui': {
            'field': 'type',
        }
    },
    'status': {
        'facet': facets.status,
        'ui': {
            'field': 'status',
        }
    },
}
"""Invenio requests facets."""

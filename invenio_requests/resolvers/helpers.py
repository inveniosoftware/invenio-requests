# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Module for resolvers."""

from flask import current_app

from .base import EntityResolver


def resolve_entity(reference_dict, raise_=False):
    """Resolve the referenced entity via the configured resolvers.

    If `REQUESTS_ENTITY_RESOLVERS` does not contain a matching EntityResolver
    for the given `reference_dict`, the `raise_` parameter determines whether
    a `ValueError` is raised or `None` is returned.
    """
    for resolver in current_app.config.get("REQUESTS_ENTITY_RESOLVERS", []):
        if resolver.matches_dict(reference_dict):
            return resolver.resolve(reference_dict, check=False)

    if raise_:
        raise ValueError(f"no matching resolver registered for: {reference_dict}")

    return None


def reference_entity(entity, raise_=False):
    for resolver in current_app.config.get("REQUESTS_ENTITY_RESOLVERS", []):
        if resolver.matches_entity(entity):
            return resolver.reference(entity, check=False)

    if raise_:
        raise ValueError(f"no matching resolver registered for: {type(entity)}")

    return None


__all__ = ("EntityResolver",)

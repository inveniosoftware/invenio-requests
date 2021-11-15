# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Resolver for users."""


from invenio_accounts.models import User

from .base import EntityResolver


class UserResolver(EntityResolver):
    """Resolver for user entities."""

    ENTITY_TYPE_KEY = "user"
    ENTITY_TYPE_CLASS = User

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
from .helpers import reference_entity, resolve_entity
from .records import RecordResolver

# from .requests import RequestResolver
from .users import UserResolver

__all__ = (
    "EntityResolver",
    "RecordResolver",
    # "RequestResolver",
    "UserResolver",
)

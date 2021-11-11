# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio module for generic and customizable requests."""

from .records.api import Request
from .services.permissions import PermissionPolicy

REQUESTS_PERMISSION_POLICY = PermissionPolicy
"""Override the default requests/comments permission policy."""

# TODO maybe only a list of classes?
#      because we can get the 'request_type' strings from the classes
REQUESTS_REGISTERED_TYPES = {Request.request_type.value: Request}
"""Configuration for registered Request Types."""

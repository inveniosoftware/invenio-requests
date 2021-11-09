# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio module for generic and customizable requests."""

from .records.api import Request
from .resources import RequestsResourceConfig
from .services import RequestCommentsServiceConfig, RequestsServiceConfig

REQUESTS_SERVICE_CONFIG = RequestsServiceConfig
"""Configuration for the requests service."""

REQUESTS_RESOURCE_CONFIG = RequestsResourceConfig
"""Configuration for the requests resource."""

REQUESTS_COMMENTS_SERVICE_CONFIG = RequestCommentsServiceConfig
"""Configuration for the request comments service."""

# TODO maybe only a list of classes?
#      because we can get the 'request_type' strings from the classes
REQUESTS_REGISTERED_TYPES = {Request.request_type.value: Request}
"""Configuration for registered Request Types."""

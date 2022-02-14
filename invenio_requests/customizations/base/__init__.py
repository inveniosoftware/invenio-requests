# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
# Copyright (C) 2022 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Base classes for request customization."""

from .actions import RequestAction, RequestActions
from .permissions import BaseRequestPermissionPolicy
from .request_types import RequestType
from .states import RequestState

__all__ = (
    "BaseRequestPermissionPolicy",
    "RequestAction",
    "RequestActions",
    "RequestType",
    "RequestState",
)

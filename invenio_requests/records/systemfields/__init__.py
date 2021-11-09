# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Systemfields for request records."""

from .identity import IdentityField
from .status import RequestStatusField

__all__ = (
    "IdentityField",
    "RequestStatusField",
)

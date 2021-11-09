# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Request comment services module."""

from .config import RequestCommentsServiceConfig
from .results import CommentResultItem
from .service import RequestCommentsService

__all__ = (
    "CommentResultItem",
    "RequestCommentsService",
    "RequestCommentsServiceConfig",
)

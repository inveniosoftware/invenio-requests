# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Validation utilities for request records."""

from ..errors import ThreadingNotSupportedError


def validate_threading_allowed(event):
    """Validate that an event type allows threading before setting parent_id.

    :param event: The RequestEvent instance to validate.
    :raises ThreadingNotSupportedError: If the event type doesn't support threading
                                        but has a parent_id set.
    """
    if event.model.parent_id is not None:
        # Check if event type supports threading
        if hasattr(event, "type") and event.type:
            if not getattr(event.type, "allow_threading", False):
                raise ThreadingNotSupportedError(
                    event.type.type_id,
                    f"Event type '{event.type.type_id}' does not support threading. "
                    f"Cannot set parent_id for this event type."
                )

# SPDX-FileCopyrightText: 2026 Graz University of Technology.
# SPDX-License-Identifier: MIT

"""Jinja helper functions."""


def get_notification_user_name(user_obj):
    """Return the appropriate user name based on the notification object properties."""
    if isinstance(user_obj, str):
        return user_obj

    if full_name := user_obj.get("profile", {}).get("full_name"):
        return full_name

    if username := user_obj.get("username"):
        return f"@{username}"

    return None

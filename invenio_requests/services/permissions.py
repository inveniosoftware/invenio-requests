# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021-2022 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Request permissions."""

from invenio_records_permissions import RecordPermissionPolicy
from invenio_records_permissions.generators import AuthenticatedUser, SystemProcess


class PermissionPolicy(RecordPermissionPolicy):
    """Permission policy."""

    # For search, recall that _what_ identities can see is defined by `can_read`
    # All other `can_` are taken care by the request types
    can_search = [AuthenticatedUser(), SystemProcess()]

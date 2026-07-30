# SPDX-FileCopyrightText: 2023-2026 CERN.
# SPDX-FileCopyrightText: 2023 Graz University of Technology.
# SPDX-License-Identifier: MIT

"""Facet definitions."""

from invenio_i18n import lazy_gettext as _
from invenio_records_resources.services.records.facets import TermsFacet

type = TermsFacet(
    field="type",
    label=_("Type"),
    # Apply as a query filter so facet aggregations match the result list.
    # With the default post_filter=True, type filters hide hits while leaving
    # unrelated type counts visible (e.g. admin Requests with type=record-deletion).
    post_filter=False,
    value_labels={
        # Access
        "guest-access-request": _("Guest access"),
        "user-access-request": _("User access"),
        # Community record and draft submission
        "community-inclusion": _("Community inclusion"),
        "community-submission": _("Draft review"),
        # Membership
        "community-membership-request": _("Membership request"),
        "community-invitation": _("Member invitation"),
        # Subcommunity
        "subcommunity": _("Subcommunity"),
        "subcommunity-invitation": _("Subcommunity invitation"),
        # Moderation
        "user-moderation": _("User moderation"),
        "record-deletion": _("Record deletion"),
        "file-modification": _("File modification"),
        "quota-increase": _("Quota increase"),
        # Instance-specific labels which ideally should not be listed here
        "community-manage-record": _("Community manage record"),
        "legacy-record-upgrade": _("Upgrade legacy record"),
    },
)

status = TermsFacet(
    field="status",
    label=_("Status"),
    value_labels={
        "submitted": _("Submitted"),
        "expired": _("Expired"),
        "accepted": _("Accepted"),
        "declined": _("Declined"),
        "cancelled": _("Cancelled"),
    },
)


is_open = TermsFacet(
    field="is_open",
    label=_("Open"),
    value_labels={
        "true": _("Open"),
        "false": _("Closed"),
    },
)

# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-2026 Graz University of Technology.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Tasks tests."""

from datetime import datetime, timedelta, timezone

from invenio_access.permissions import system_identity
from invenio_search.engine import dsl

from invenio_requests.records.api import Request
from invenio_requests.tasks import check_expired_requests


def test_check_expired_requests(
    app, identity_simple, create_request, submit_request, requests_service
):
    """Test if the expired system field works as intended."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # created only should not be picked up
    created_request = create_request(
        identity=identity_simple, expires_at=now.isoformat()
    )
    Request.index.refresh()
    check_expired_requests()
    Request.index.refresh()
    request_list = requests_service.search(
        identity=system_identity,
        extra_filter=dsl.query.Bool(
            "must",
            must=[
                dsl.Q("term", **{"is_closed": True}),
            ],
        ),
    )
    assert request_list.total == 0

    # no expires_at should not be touched
    s1 = submit_request(identity_simple)
    Request.index.refresh()
    check_expired_requests()
    Request.index.refresh()
    request_list = requests_service.search(
        identity=system_identity,
        extra_filter=dsl.query.Bool(
            "must",
            must=[
                dsl.Q("term", **{"is_closed": True}),
            ],
        ),
    )
    assert request_list.total == 0

    # expiry date in future should not be touched
    s2 = submit_request(
        identity_simple, expires_at=(now + timedelta(days=1)).isoformat()
    )
    Request.index.refresh()
    check_expired_requests()
    Request.index.refresh()
    request_list = requests_service.search(
        identity=system_identity,
        extra_filter=dsl.query.Bool(
            "must",
            must=[
                dsl.Q("term", **{"is_closed": True}),
            ],
        ),
    )
    assert request_list.total == 0

    s3 = submit_request(identity_simple, expires_at=now.isoformat())
    Request.index.refresh()
    check_expired_requests()
    Request.index.refresh()
    request_list = requests_service.search(
        identity=system_identity,
        extra_filter=dsl.query.Bool(
            "must",
            must=[
                dsl.Q("term", **{"is_closed": True}),
            ],
        ),
    )
    assert request_list.total == 1

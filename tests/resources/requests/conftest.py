# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Request resource conftest."""

import pytest
from invenio_access.permissions import system_identity as sys_id

from invenio_requests.customizations.default import DefaultRequestType


@pytest.fixture()
def example_requests(app, users):
    """A few example requests."""
    svc = app.extensions["invenio-requests"].requests_service

    u1, u2, u3 = users
    req1 = svc.create(
        sys_id, {"title": "first"}, DefaultRequestType, receiver=u1, creator=u3
    )._obj
    req2 = svc.create(
        sys_id, {"title": "second"}, DefaultRequestType, receiver=u1, creator=u3
    )._obj
    req3 = svc.create(
        sys_id, {"title": "third"}, DefaultRequestType, receiver=u2, creator=u3
    )._obj

    # this is needed to make sure that the requests are indexed in time,
    # before the tests are run
    req1.index.refresh()
    req2.index.refresh()
    req3.index.refresh()

    return [req1, req2, req3]

# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Fake Request Type for Mock Module."""

from invenio_requests.customizations import RequestType


class FakeRequestType(RequestType):
    """A fake RequestType.

    There is no such thing as a generic RequestType in reality. This way
    we an also test link mechanism.
    """

    endpoints_item = {
        "self_html": "invenio_requests_mock_module.request_detail",
    }

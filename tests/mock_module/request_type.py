# -*- coding: utf-8 -*-
#
# Copyright (C) 2026 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Fake Request Type for Mock Module."""

from invenio_records_resources.services import EndpointLink

from invenio_requests.customizations import RequestType


class FakeRequestType(RequestType):
    """A fake RequestType.

    There is no such thing as a generic RequestType in reality. This way
    we an also test link mechanism.
    """

    @staticmethod
    def anchor_func(obj, vars):
        """Anchor generating function.

        This only generates an anchor if request_event is not None in vars.
        This way the same EndpointLink can be used to generate
        - the link to the Request UI (no anchor)
        - the link to the RequestEvent UI (anchor)
        """
        request_event = vars["request_event"]
        if request_event is None:
            return None
        return f"commentevent-{request_event.id}"

    links_item = {
        "self_html": EndpointLink(
            "invenio_requests_mock_module.request_detail",
            params=["request_pid_value"],
            # Makes use of agreed values
            vars=lambda obj, vars: vars.update(request_pid_value=vars["request"].id),
            anchor=anchor_func,
        )
    }

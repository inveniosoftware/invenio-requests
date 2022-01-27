# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Request views module."""

from flask import render_template

from invenio_requests.views.decorators import pass_request


@pass_request
def requests_detail(request=None, pid_value=None):
    """Community detail page."""
    request_dict = request.to_dict()

    # temporarily, until serializers and avatars implemented
    request_dict["created_by"].update({
        "avatar": "/static/images/placeholder.png",
        "full_name": "Uma Thurman"
    })

    request_dict["receiver"].update({
        "avatar": "/static/images/placeholder.png",
        "full_name": "John Travolta"
    })

    request_dict["topic"] = request._request.topic.resolve()

    return render_template(
        "invenio_requests/details/index.html",
        request=request_dict,  # TODO: use serializer
        # Pass permissions so we can disable partially UI components
        permissions=request.has_permissions_to(['update', 'read']),
    )

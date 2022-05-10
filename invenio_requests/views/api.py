# -*- coding: utf-8 -*-
#
# Copyright (C) 2021-2022 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""View functions for the requests."""

from flask import Blueprint

blueprint = Blueprint('invenio_requests_ext', __name__)


@blueprint.record_once
def init(state):
    """Init app."""
    app = state.app
    # Register services - cannot be done in extension because
    # Invenio-Records-Resources might not have been initialized.
    rr_ext = app.extensions['invenio-records-resources']
    i_ext = app.extensions['invenio-indexer']
    ext = app.extensions['invenio-requests']

    # service
    rr_ext.registry.register(ext.requests_service)
    # indexer
    i_ext.registry.register(
        ext.requests_service.indexer, indexer_id='requests'
    )
    # change notification handlers
    rr_ext.notification_registry.register(
        "members", ext.requests_service.on_relation_update
    )


def create_requests_bp(app):
    """Create requests blueprint."""
    ext = app.extensions["invenio-requests"]
    return ext.requests_resource.as_blueprint()


def create_request_events_bp(app):
    """Create request events blueprint."""
    ext = app.extensions["invenio-requests"]
    return ext.request_events_resource.as_blueprint()

# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio module for generic and customizable requests."""

from . import config
from .resources import RequestsResource
from .services import RequestCommentsService, RequestsService, RequestTypeRegistry


class InvenioRequests:
    """Invenio-Requests extension."""

    def __init__(self, app=None):
        """Extension initialization."""
        self.requests_service = None
        self.requests_resource = None
        self.request_comments_service = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Flask application initialization."""
        self.init_config(app)
        self.init_services(app)
        self.init_registry(app)
        app.extensions["invenio-requests"] = self

    def init_config(self, app):
        """Initialize configuration."""
        for k in dir(config):
            if k.startswith("REQUESTS_"):
                app.config.setdefault(k, getattr(config, k))

    def init_services(self, app):
        """Initialize the service and resource for Requests."""
        self.requests_service = RequestsService(
            config=app.config["REQUESTS_SERVICE_CONFIG"],
        )
        self.requests_resource = RequestsResource(
            service=self.requests_service,
            config=app.config["REQUESTS_RESOURCE_CONFIG"],
        )
        self.request_comments_service = RequestCommentsService(
            config=app.config["REQUESTS_COMMENTS_SERVICE_CONFIG"],
        )

    def init_registry(self, app):
        """Initialize the resgistry for Requests per type."""
        self.request_type_registry = RequestTypeRegistry(
            app.config["REQUESTS_REGISTERED_TYPES"]
        )

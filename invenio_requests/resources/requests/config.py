# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Requests resource config."""


import marshmallow as ma
from flask_resources import JSONSerializer, ResponseHandler
from invenio_records_resources.resources import (
    RecordResourceConfig,
    SearchRequestArgsSchema,
)
from invenio_records_resources.resources.records.headers import etag_headers

from .fields import ReferenceString


#
# Request args
#
class RequestSearchRequestArgsSchema(SearchRequestArgsSchema):
    """Add parameter to parse tags."""

    created_by = ReferenceString()
    topic = ReferenceString()
    receiver = ReferenceString()


#
# Resource config
#
class RequestsResourceConfig(RecordResourceConfig):
    """Requests resource configuration."""

    blueprint_name = "requests"
    url_prefix = "/requests"
    routes = {
        "list": "/",
        "item": "/<id>",
        "action": "/<id>/actions/<action>",
    }

    request_view_args = {
        "id": ma.fields.Str(),
        "action": ma.fields.Str(),
    }

    request_search_args = RequestSearchRequestArgsSchema

    response_handlers = {
        "application/json": ResponseHandler(JSONSerializer(), headers=etag_headers),
        # TODO
        # "application/vnd.inveniordm.v1+json": ResponseHandler(
        #     MarshmallowJSONSerializer(
        #         schema_cls=VocabularyL10NItemSchema,
        #         many_schema_cls=VocabularyL10NListSchema,
        #     ),
        #     headers=etag_headers,
        # ),
    }

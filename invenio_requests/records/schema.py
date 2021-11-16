# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Requests service schema."""


from datetime import timezone

from invenio_records_resources.services.records.schema import BaseRecordSchema
from marshmallow import Schema, fields
from marshmallow_utils.fields import SanitizedUnicode, TZDateTime


class AgentSchema(Schema):
    """An agent schema."""

    # straight out of RDM-Records!
    # TODO will need to accomodate for communities (as receivers), records (as
    #      subjects/associated objects) and probably a few more
    #      - but only for one of them at a time!
    user = fields.String(required=True)


class RequestSchema(BaseRecordSchema):
    """Schema for requests."""

    request_type = fields.String(dump_only=True)
    title = SanitizedUnicode(required=True)
    description = SanitizedUnicode()
    payload = fields.Dict(dump_only=True)

    # routing information can likely be inferred during creation
    created_by = fields.Nested(AgentSchema, dump_only=True)
    receiver = fields.Nested(AgentSchema, dump_only=True)
    subject = fields.Nested(AgentSchema, dump_only=True)

    # status information is also likely set by the service
    status = fields.String(dump_only=True)
    is_open = fields.Boolean(dump_only=True)
    expires_at = TZDateTime(timezone=timezone.utc, format="iso", dump_only=True)
    is_expired = fields.Boolean(dump_only=True)

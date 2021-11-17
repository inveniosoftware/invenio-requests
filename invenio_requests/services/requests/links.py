# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Utility for rendering URI template links."""

from invenio_records_resources.services.base.links import Link


class RequestLink(Link):
    """Shortcut for writing request links."""

    @staticmethod
    def vars(record, vars):
        """Variables for the URI template."""
        # TODO this uses the UUID of the record, should we maybe use the number/ext-id?
        vars.update({"id": record.id})

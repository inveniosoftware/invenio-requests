# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Identity systemfield."""

from uuid import uuid4

from invenio_records.systemfields import ModelField


class IdentityField(ModelField):
    """Systemfield for managing the request status."""

    def generate(self, record, **kwargs):
        """Generate a new identifier.

        This function is supposed to be overridden for custom request
        sub-types.
        """
        return str(uuid4())

    def assign(self, record, **kwargs):
        """Generate and assign a new identifier if none is set yet."""
        try:
            value = getattr(record.model, self.model_field_name)
        except AttributeError:
            value = None

        if value is None:
            value = self.generate(record, **kwargs)
            self._set(record.model, value)

        return value

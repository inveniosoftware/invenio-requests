# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Pytest configuration.

See https://pytest-invenio.readthedocs.io/ for documentation on which test fixtures
are available.
"""

import pytest


@pytest.fixture()
def rw_app(app):
    """Fixture that resets the read-only mode before and after tests.

    This is done in order to prevent permission issues with other fixtures when the
    app isn't freshly initialized for each test.
    """
    app.config["RECORDS_PERMISSIONS_READ_ONLY"] = False
    yield app
    app.config["RECORDS_PERMISSIONS_READ_ONLY"] = False

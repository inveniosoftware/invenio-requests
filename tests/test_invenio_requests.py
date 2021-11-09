# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Module tests."""

from flask import Flask

from invenio_requests import InvenioRequests


def test_version():
    """Test version import."""
    from invenio_requests import __version__

    assert __version__


def test_init():
    """Test extension initialization."""
    app = Flask("testapp")
    ext = InvenioRequests(app)
    assert "invenio-requests" in app.extensions

    app = Flask("testapp")
    ext = InvenioRequests()
    assert "invenio-requests" not in app.extensions
    ext.init_app(app)
    assert "invenio-requests" in app.extensions

# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Test the service configuration."""

import pytest
from invenio_records_permissions.generators import AnyUser

from invenio_requests.proxies import current_requests
from invenio_requests.services import RequestsServiceConfig
from invenio_requests.services.permissions import PermissionPolicy


class CustomPermissionPolicy(PermissionPolicy):
    """Custom permission policy."""

    can_test = [AnyUser()]


@pytest.fixture(scope="module")
def app_config(app_config):
    """Fixture for customizing the service config via app config."""
    app_config["REQUESTS_PERMISSION_POLICY"] = CustomPermissionPolicy
    return app_config


def test_customizations_via_app_config(app):
    """Test if the customization mechanism works correctly."""
    current_permission_policy_cls = (
        current_requests.requests_service.config.permission_policy_cls
    )

    assert current_permission_policy_cls is CustomPermissionPolicy
    assert hasattr(current_permission_policy_cls, "can_test")


def test_customization_mixin(app):
    """Test if the customize mixin method does what it is supposed to do."""
    custom_config = RequestsServiceConfig.build(app)

    # check if it created a new instance
    assert custom_config is not RequestsServiceConfig

    # check if using custom permission policy
    assert custom_config.permission_policy_cls is CustomPermissionPolicy

# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.
"""Test user moderation service."""

import pytest
from flask_principal import Need
from invenio_access.permissions import system_identity
from invenio_access.utils import get_identity
from invenio_records_resources.resources.errors import PermissionDeniedError
from marshmallow import ValidationError

from invenio_requests.errors import CannotExecuteActionError
from invenio_requests.proxies import (
    current_requests_service,
    current_user_moderation_service,
)
from invenio_requests.services.user_moderation.errors import OpenRequestAlreadyExists


def test_request_moderation(app, search_clear, users, identity_simple, mod_identity):
    """Tests the service for request moderation."""

    user1 = users["user1"]
    user2 = users["user2"]

    service = current_user_moderation_service

    # Use system identity
    request_item = service.request_moderation(system_identity, user_id=user1.id)
    assert request_item
    # Request moderation creates and submits the moderation request
    assert request_item._request.status == "submitted"

    # User identity is not allowed to submit moderation requests
    with pytest.raises(Exception):
        service.request_moderation(identity_simple, user_id=user1.id)

    # Use moderator identity
    request_item = service.request_moderation(mod_identity, user_id=user2.id)
    assert request_item
    # Request moderation creates and submits the moderation request
    assert request_item._request.status == "submitted"


def test_search_moderation(app, search_clear, users, submit_request, mod_identity):
    """Tests the search for request moderation."""

    user = users["user2"]

    service = current_user_moderation_service

    request_item = service.request_moderation(system_identity, user_id=user.id)
    assert request_item

    # Create a generic request to test the user moderation search filter
    request = submit_request(system_identity, receiver=user.user)
    assert request

    # The user can search user moderation requests but can't see anything
    user_identity = get_identity(user.user)
    user_identity.provides.add(Need(method="system_role", value="authenticated_user"))
    search = current_requests_service.search(user_identity)
    assert search.total == 1  # User can see generic request
    assert search.to_dict()["hits"]["hits"][0]["type"] == "base-request"

    # Moderator can search and see the request
    search = current_requests_service.search(mod_identity)
    assert search.total == 1  # Moderator can see user moderation request
    hits = search.to_dict()["hits"]["hits"]
    hit = hits[0]
    assert hit["topic"]["user"] == str(user.id)
    assert hit["type"] == service.request_type_cls.type_id

    # System process can see the request
    search = current_requests_service.search(system_identity)
    assert search.total == 2  # System process can see both requests


def test_moderation_accept(app, search_clear, users, mod_identity):
    """Tests the service for moderation."""
    user = users["user1"]

    service = current_user_moderation_service

    request_item = service.request_moderation(system_identity, user_id=user.id)
    assert request_item
    assert request_item._request.status == "submitted"

    # Test accept
    current_requests_service.execute_action(
        mod_identity, id_=request_item.id, action="accept"
    )
    req_read = current_requests_service.read(mod_identity, request_item.id)
    assert req_read._request.status == "accepted"

    with pytest.raises(CannotExecuteActionError):
        current_requests_service.execute_action(
            mod_identity, id_=request_item.id, action="decline"
        )


def test_moderation_decline(app, search_clear, users, mod_identity):
    """Tests the service for moderation."""
    user = users["user1"]

    service = current_user_moderation_service

    request_item = service.request_moderation(system_identity, user_id=user.id)
    assert request_item
    assert request_item._request.status == "submitted"

    # Test decline
    current_requests_service.execute_action(
        mod_identity, id_=request_item.id, action="decline"
    )
    req_read = current_requests_service.read(mod_identity, request_item.id)
    assert req_read._request.status == "declined"

    with pytest.raises(CannotExecuteActionError):
        current_requests_service.execute_action(
            mod_identity, id_=request_item.id, action="accept"
        )


def test_read(app, search_clear, users, mod_identity):
    """Tests the service for read."""
    user = users["user1"]

    service = current_user_moderation_service

    request_item = service.request_moderation(system_identity, user_id=user.id)
    assert request_item
    assert request_item._request.status == "submitted"

    # Test read
    req_read = current_requests_service.read(mod_identity, request_item.id)
    assert req_read._request.status == "submitted"

    user_identity = get_identity(user.user)
    user_identity.provides.add(Need(method="system_role", value="authenticated_user"))
    with pytest.raises(PermissionDeniedError):
        current_requests_service.read(user_identity, request_item.id)


def test_invalid_request_data(app, search_clear, users, mod_identity):
    """Test request creation with invalid data."""
    user = users["user1"]

    service = current_user_moderation_service

    with pytest.raises(ValidationError):
        service.request_moderation(
            mod_identity, user_id=user.id, data={"invalid": "data"}
        )


def test_duplicate_request(app, search_clear, users, mod_identity):
    """Test request creation when a request is already open."""
    user = users["user1"]
    service = current_user_moderation_service

    # Create a moderation request
    first_request = service.request_moderation(mod_identity, user_id=user.id)
    assert first_request
    assert first_request._request.status == "submitted"

    # Duplicated request are not allowed
    with pytest.raises(OpenRequestAlreadyExists):
        service.request_moderation(mod_identity, user_id=user.id)  # nothing will happen

    # Verify that only the first request was created
    res = current_requests_service.search(
        mod_identity, params={"q": f"topic.user:{user.id}"}
    )
    assert res.total == 1
    assert res.to_dict()["hits"]["hits"][0]["id"] == first_request.id

    # Resolve the request and re-request moderation
    current_requests_service.execute_action(
        mod_identity, id_=first_request.id, action="decline"
    )

    # New request
    request_item = service.request_moderation(mod_identity, user_id=user.id)
    assert request_item
    assert request_item._request.status == "submitted"

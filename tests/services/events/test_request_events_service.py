# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Service tests."""
import copy

from invenio_requests.proxies import current_requests
from invenio_requests.records.api import RequestEvent, RequestEventType


def test_simple_flow(app, identity_simple, events_service_data, example_request):
    """Interact with comment events."""
    events_service = current_requests.request_events_service
    request_id = example_request.id

    # Create a comment
    item = events_service.create(identity_simple, request_id, events_service_data)
    item_dict = item.to_dict()
    assert events_service_data["type"] == item_dict["type"]
    assert events_service_data["content"] == item_dict["content"]
    assert events_service_data["format"] == item_dict["format"]
    id_ = item.id

    # Read it
    read_item = events_service.read(identity_simple, id_)
    assert item.id == read_item.id
    assert item.to_dict() == read_item.to_dict()

    # Update it
    data = read_item.to_dict()  # should be equivalent to events_service_data
    data["content"] = "An edited comment"
    updated_item = events_service.update(identity_simple, id_, data)
    assert id_ == updated_item.id
    assert "An edited comment" == updated_item.to_dict()["content"]

    # Delete it
    deleted_item = events_service.delete(identity_simple, id_)
    assert id_ == deleted_item.id
    del_item_dict = deleted_item.to_dict()
    assert RequestEventType.DELETED_COMMENT.value == del_item_dict["type"]
    assert "" == del_item_dict["content"]
    read_deleted_item = events_service.read(identity_simple, id_)
    read_del_item_dict = read_deleted_item.to_dict()
    assert id_ == read_deleted_item.id
    assert RequestEventType.DELETED_COMMENT.value == read_del_item_dict["type"]

    # Search (batch read) events
    # first add another comment
    data = copy.deepcopy(events_service_data)
    data["content"] = "Another comment."
    item2 = events_service.create(identity_simple, request_id, data)
    # Refresh to make changes live
    RequestEvent.index.refresh()
    # then search
    searched_items = events_service.search(
        identity_simple,
        {"request_id": request_id},
        size=10,
        page=1,
    )
    assert 2 == searched_items.total


def test_other_event_flow():
    """Interact with other events."""
    # events_service_data["type"] = RequestEventType.ACCEPT
    pass
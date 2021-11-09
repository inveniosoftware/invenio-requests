# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Service tests."""

from invenio_requests.proxies import current_requests


def test_simple_flow(app, identity_simple, comments_service_data, example_request):
    """Interact with comments."""
    # Create a comment
    comments_service = current_requests.request_comments_service
    # TODO should probably use the request's internal id?
    item = comments_service.create(
        example_request.id, identity_simple, comments_service_data
    )
    id_ = item.id

    # # Read it
    # read_item = comments_service.read(id_, identity_simple)
    # assert item.id == read_item.id
    # assert item.data == read_item.data

    # # Refresh to make changes live
    # RequestComments.index.refresh()

    # # Update it
    # data = read_item.data  # should be equivalent to comments_service_data
    # data['payload']['text'] = 'An edited comment'
    # update_item = comments_service.update(id_, identity_simple, data)
    # assert item.id == update_item.id
    # assert 'An edited comment' == update_item['payload']['text']
    # # test updated is now different from created too

    # # Delete it
    # deleted_item = comments_service.delete(id_, identity_simple)
    # # whatever is the convention we use
    # assert {"status": "deleted"} == deleted_item
    # read_deleted_item = comments_service.read(id_, identity_simple)
    # # pytest.raises(PIDDeletedError, service.read, id_, identity_simple)
    # assert {"status": "deleted"} == read_deleted_item

    # # Undelete comment?

    # # Search comments (search will be used as batch read)
    # # this way we make sure that we can display a subset of the comments
    # # on the comment page and then later all comments
    # #- Create another comment
    # item = comments_service.create(identity_simple, comments_service_data)

    # searched_items = comments_service.search(
    #     identity_simple, q=f"id:{id_}", size=10, page=1,  # sorted old to new
    # )
    # assert 2 == searched_items.total
    # assert list(searched_items.hits)[0] == read_item.data

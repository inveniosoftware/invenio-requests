# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

from invenio_records_resources.services import RecordService

from .results import CommentResultItem


class RequestCommentsService(RecordService):
    """Request Comments service."""

    def create(self, request_id, identity, data):
        """Create a request comment."""
        request = self._get_request(request_id, identity, "create_comments")

        return self._comment_result_item(
            self,
            identity,
            request=request,
        )

    def _get_request(self, *args, **kwargs):
        """Get associated request."""
        # TODO: Implement me
        return {}

    def _comment_result_item(self, *args, **kwargs):
        """Create a CommentResultItem."""
        # TODO: Implement me
        return CommentResultItem()

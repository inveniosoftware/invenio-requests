# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Unit of work operations for request events."""

from invenio_records_resources.services.uow import RecordCommitOp


class ParentChildRecordCommitOp(RecordCommitOp):
    """Record commit operation with parent-child relationship routing support.

    This operation extends RecordCommitOp to add routing for child documents
    in parent-child relationships. Child documents must be indexed on the
    same shard as their parent for join queries to work correctly.
    """

    def on_commit(self, uow):
        """Run the operation with routing for join relationships."""
        if self._indexer is not None:
            arguments = {"refresh": True} if self._index_refresh else {}

            # Add routing for child documents (join relationships)
            # Routes child to same shard as parent, required for join queries
            if hasattr(self._record, "parent_id") and self._record.parent_id:
                arguments["routing"] = str(self._record.parent_id)

            self._indexer.index(self._record, arguments=arguments)

# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Computed system fields for requests."""

from datetime import datetime

from invenio_db import db
from invenio_records_resources.records.systemfields.calculated import (
    CalculatedField,
)

from ...customizations import CommentEventType


class CachedCalculatedField(CalculatedField):
    """Cache-aware calculated field."""

    CACHE_MISS = object()

    def __init__(self, key=None, use_cache=True):
        """Constructor."""
        super().__init__(key=key, use_cache=use_cache)

    def calculate(self, record):
        """Fetch the calculated field from the cache if present."""
        # TODO: This logic should be pushed up to the `CalculatedField` class. If the
        # cache has a key for the system field, even if the value is `None`, it means
        # that the value was already calculated or explicitly cached, e.g. in
        # `post_load`.
        obj_cache = getattr(record, "_obj_cache", None)
        if obj_cache is not None and self.attr_name in obj_cache:
            return obj_cache[self.attr_name]
        return self.CACHE_MISS


class LastReply(CachedCalculatedField):
    """System field for getting the last reply event."""

    def __init__(self, key=None, use_cache=True):
        """Constructor."""
        super().__init__(key=key, use_cache=use_cache)

    def calculate(self, record):
        """Fetch the last reply event."""
        res = super().calculate(record)
        if res is not self.CACHE_MISS:
            return res

        RequestEvent = record.event_cls
        RequestEventModel = RequestEvent.model_cls

        last_comment = (
            db.session.query(RequestEventModel)
            .filter(
                RequestEventModel.request_id == record.id,
                RequestEventModel.type == CommentEventType.type_id,
            )
            .order_by(RequestEventModel.created.desc())
            .first()
        )

        if last_comment:
            return RequestEvent(data=last_comment.data, model=last_comment)

        return None

    def pre_dump(self, record, data, dumper=None):
        """Called before a record is dumped."""
        last_reply = getattr(record, self.attr_name)
        if last_reply:
            data[self.attr_name] = last_reply.dumps()
        else:
            data[self.attr_name] = None

    def post_load(self, record, data, loader=None):
        """Called after a record was loaded."""
        RequestEvent = record.event_cls
        record.pop(self.attr_name, None)  # Remove the attribute from the record
        last_reply_dump = data.pop(self.attr_name, None)
        last_reply = None
        if last_reply_dump:
            last_reply = RequestEvent.loads(last_reply_dump)
        self._set_cache(record, last_reply)


class LastActivity(CachedCalculatedField):
    """System field for getting the last activity (derived from other fields)."""

    def __init__(self, key=None, use_cache=True):
        """Constructor."""
        super().__init__(key=key, use_cache=use_cache)

    def calculate(self, record):
        """Calculate the last activity."""
        res = super().calculate(record)
        if res is not self.CACHE_MISS:
            return res

        activity_dates = [record.model.updated]

        # Take into account the last comment if any
        # TODO: Extend this to other event types
        last_comment = record.last_reply
        if last_comment:
            activity_dates.append(last_comment.model.created)

        return max(activity_dates)

    def pre_dump(self, record, data, dumper=None):
        """Called before a record is dumped."""
        last_activity = getattr(record, self.attr_name)
        if last_activity:
            data[self.attr_name] = last_activity.isoformat()
        else:
            data[self.attr_name] = None

    def post_load(self, record, data, loader=None):
        """Called after a record was loaded."""
        record.pop(self.attr_name, None)  # Remove the attribute from the record
        last_activity_dump = data.pop(self.attr_name, None)
        last_activity = None
        if last_activity_dump:
            last_activity = datetime.fromisoformat(last_activity_dump)
        self._set_cache(record, last_activity)


class EventChildren(CachedCalculatedField):
    """System field for event children with limited preview indexing.

    By default, fetches only the most recent N children from the database to avoid
    loading all children into memory. Provides metadata for lazy loading additional
    children via pagination.

    Can optionally fetch all children when needed for operations like deletion,
    export, or administration. Use with caution for records with many children.
    """

    def __init__(self, key=None, use_cache=True):
        """Constructor.

        :param key: The name of the attribute (defaults to 'children').
        :param use_cache: Whether to cache the calculated value.
        """
        super().__init__(key=key, use_cache=use_cache)

    def _get_preview_limit(self):
        """Get the preview limit from config."""
        from flask import current_app

        return current_app.config.get("REQUESTS_COMMENT_PREVIEW_LIMIT", 5)

    def calculate(self, record, fetch_all=False):
        """Fetch children from the database.

        By default, queries the database with a limit to avoid loading all children
        into memory. Can optionally fetch all children when needed.

        :param record: The parent event record.
        :param fetch_all: If True, fetch all children. If False, fetch only preview.
        :returns: List of RequestEvent instances representing children.

        .. warning::
           Using fetch_all=True with records that have 1000+ children may cause
           performance issues. Use only when genuinely needed (e.g., deletion,
           export, admin operations).
        """
        # Skip cache lookup when fetching all (different data than cached preview)
        if not fetch_all:
            res = super().calculate(record)
            if res is not self.CACHE_MISS:
                return res

        if not record.model:
            return []

        RequestEvent = type(record)
        RecordEventModel = record.model_cls

        # Build query
        query = (
            db.session.query(RecordEventModel)
            .filter(RecordEventModel.parent_id == record.id)
            .order_by(RecordEventModel.created.desc())
        )

        # Apply limit only if not fetching all
        if not fetch_all:
            preview_limit = self._get_preview_limit()
            query = query.limit(preview_limit)

        children_models = query.all()
        return [RequestEvent(child.data, model=child) for child in children_models]

    def pre_dump(self, record, data, dumper=None):
        """Dump limited children preview with metadata to the search index.

        Only dumps the most recent N children to keep document size bounded.
        Includes metadata (count, has_more) for lazy loading additional children.
        """
        preview_limit = self._get_preview_limit()
        preview_children = getattr(record, self.attr_name)

        if preview_children:
            # Get total count directly from database
            RecordEventModel = record.model_cls
            total_count = (
                db.session.query(db.func.count(RecordEventModel.id))
                .filter(RecordEventModel.parent_id == record.id)
                .scalar()
            )

            # Dump preview children with full metadata
            data["children_preview"] = [child.dumps() for child in preview_children]
            data["children_count"] = total_count
            data["has_more_children"] = total_count > preview_limit
        else:
            data["children_preview"] = []
            data["children_count"] = 0
            data["has_more_children"] = False

    def get_all_children(self, record):
        """Fetch all children for a record (no limit).

        Convenience method for operations that need access to all children
        regardless of the preview limit.

        :param record: The parent event record.
        :returns: List of all child RequestEvent instances.

        .. warning::
           This method loads all children into memory. For records with 1000+
           children, this may cause performance issues. Use only when necessary
           for operations like cascade deletion, full export, or admin tasks.

        Example:
            >>> # Get all children for deletion
            >>> all_children = event.children_field.get_all_children(event)
            >>> for child in all_children:
            ...     process_child(child)
        """
        return self.calculate(record, fetch_all=True)

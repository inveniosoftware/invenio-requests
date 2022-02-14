# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021-2022 Northwestern University.
# Copyright (C) 2021 - 2022 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Requests service."""

from functools import reduce
from itertools import chain

from elasticsearch_dsl.query import Q
from invenio_records_resources.config import lt_es7
from invenio_records_resources.services import RecordService, ServiceSchemaWrapper
from invenio_records_resources.services.uow import (
    RecordCommitOp,
    RecordDeleteOp,
    unit_of_work,
)
from invenio_search import current_search_client

from ...customizations.base import BaseRequestPermissionPolicy, RequestActions
from ...errors import CannotExecuteActionError
from ...proxies import current_events_service, current_registry
from ...records.api import RequestEventType
from ...resolvers.registry import ResolverRegistry
from .links import RequestLinksTemplate


class RequestsService(RecordService):
    """Requests service."""

    @property
    def links_item_tpl(self):
        """Item links template."""
        return RequestLinksTemplate(self.config.links_item, self.config.action_link)

    @property
    def request_type_registry(self):
        """Request_type_registry."""
        return current_registry

    def _wrap_schema(self, schema):
        """Wrap schema."""
        return ServiceSchemaWrapper(self, schema)

    def permission_policy(self, action_name, request_type=None, **kwargs):
        """Factory for a permission policy instance.

        Technically `request_type` should never be None and is only given this
        signature to align with `require_permission()`.
        """
        policy_cls = (
            request_type.permission_policy_cls if request_type
            else BaseRequestPermissionPolicy
        )
        return policy_cls(action_name, **kwargs)

    @unit_of_work()
    def create(
        self, identity, data, request_type, receiver, creator=None, topic=None,
        permission_args=None, uow=None
    ):
        """Create a record."""
        permission_args = permission_args or {}
        self.require_permission(
            identity, "create", request_type=request_type, **permission_args
        )

        # we're not using "self.schema" b/c the schema may differ per request type!
        schema = self._wrap_schema(request_type.marshmallow_schema())
        data, errors = schema.load(
            data,
            context={"identity": identity},
            raise_errors=False,
        )

        # most of the data is initialized via the components
        request = self.record_cls.create(
            {},
            type=request_type,
        )

        creator = (
            ResolverRegistry.reference_entity(creator)
            if creator is not None
            else ResolverRegistry.reference_identity(identity)
        )

        # Run components
        self.run_components(
            "create",
            identity,
            data=data,
            record=request,
            errors=errors,
            created_by=creator,
            topic=ResolverRegistry.reference_entity(topic),
            receiver=ResolverRegistry.reference_entity(receiver),
            uow=uow,
        )

        # persist record (DB and index)
        uow.register(RecordCommitOp(request, indexer=self.indexer))

        return self.result_item(
            self,
            identity,
            request,
            schema=schema,
            links_tpl=self.links_item_tpl,
            errors=errors,
        )

    def read(self, identity, id_):
        """Retrieve a request."""
        # resolve and require permission
        request = self.record_cls.get_record(id_)
        self.require_permission(
            identity, "read", request_type=request.type, request=request
        )

        # run components
        for component in self.components:
            if hasattr(component, "read"):
                component.read(identity, record=request)

        return self.result_item(
            self,
            identity,
            request,
            schema=self._wrap_schema(request.type.marshmallow_schema()),
            links_tpl=self.links_item_tpl,
        )

    @unit_of_work()
    def update(self, identity, id_, data, revision_id=None, uow=None):
        """Update a request."""
        request = self.record_cls.get_record(id_)

        self.check_revision_id(request, revision_id)

        self.require_permission(
            identity, "update", request_type=request.type, request=request
        )

        # we're not using "self.schema" b/c the schema may differ per request type!
        schema = self._wrap_schema(request.type.marshmallow_schema())
        data, _ = schema.load(
            data,
            context={
                "identity": identity,
                "record": request,
            },
        )

        # run components
        self.run_components("update", identity, data=data, record=request, uow=uow)

        uow.register(RecordCommitOp(request, indexer=self.indexer))

        return self.result_item(
            self,
            identity,
            request,
            schema=schema,
            links_tpl=self.links_item_tpl,
        )

    @unit_of_work()
    def delete(self, identity, id_, uow=None):
        """Delete a request from database and search indexes."""
        request = self.record_cls.get_record(id_)

        # TODO do we need revisions for requests?
        # self.check_revision_id(request, revision_id)

        # check permissions
        self.require_permission(
            identity, "delete", request_type=request.type, request=request
        )

        # TODO:
        # prevent deletion if in open state?

        # run components
        self.run_components("delete", identity, record=request, uow=uow)

        uow.register(RecordDeleteOp(request, indexer=self.indexer))
        return True

    def reindex(self, identity, params=None, es_preference=None, **kwargs):
        """Reindex records matching the query parameters."""
        # TODO check later
        return super().reindex(identity, params=None, es_preference=None, **kwargs)

    def rebuild_index(self, identity):
        """Reindex all records managed by this service."""
        for req_meta in self.record_cls.model_cls.query.all():
            request = self._request_from_model(req_meta)

            if not request.is_deleted:
                self.indexer.index(request)

    @unit_of_work()
    def execute_action(self, identity, id_, action, data=None, uow=None):
        """Execute the given action for the request, if possible.

        For instance, it would be not possible to execute the specified
        action on the request, if the latter has the wrong status.
        """
        # Retrieve request and action
        request = self.record_cls.get_record(id_)
        action_obj = RequestActions.get_action(request, action)

        # check permissions
        permission_name = f"action_{action}"
        self.require_permission(
            identity, permission_name, request_type=request.type, request=request
        )

        # Check if the action *can* be executed (i.e. correct status etc.)
        if not action_obj.can_execute(identity):
            raise CannotExecuteActionError(action)

        # Create action event if defined
        # Because the action may change the request's status, this has to be done
        # before the action is executed
        event_type = action_obj.event_type
        if event_type is not None:
            current_events_service.create(
                identity, request.id, {"type": event_type}, uow=uow
            )

        # Execute action and register request for persistence.
        action_obj.execute(identity, uow)
        uow.register(RecordCommitOp(request, indexer=self.indexer))

        # Assuming that data is just for comment payload
        if data:
            comment_type = RequestEventType.COMMENT.value
            current_events_service.create(
                identity, request.id, {**data, "type": comment_type}, uow=uow
            )

        return self.result_item(
            self,
            identity,
            request,
            schema=self._wrap_schema(request.type.marshmallow_schema()),
            links_tpl=self.links_item_tpl,
        )

    def permission_filter(self, identity, action_name):
        """Generate queries from all request_types <action_name> permissions."""
        filters = []

        for request_type in current_registry:
            policy_cls = request_type.permission_policy_cls
            permission = policy_cls(action_name, identity=identity)
            filters.append(permission.query_filters)

        if filters:
            return reduce(
                lambda q1, q2: q1 | q2,
                chain.from_iterable(filters)
            )
        else:
            # This is a MatchAll() query
            return Q()

    def create_search(self, identity, record_cls, search_opts,
                      permission_action='read', preference=None,
                      extra_filter=None):
        """Override search class instantiation.

        Searching over requests means taking into account the permissions of each
        request_type.
        """
        default_filter = self.permission_filter(identity, permission_action)

        # From here down is the same as RecordService.create_search
        if extra_filter is not None:
            default_filter = default_filter & extra_filter

        search = search_opts.search_cls(
            using=current_search_client,
            default_filter=default_filter,
            index=record_cls.index.search_alias,
        )

        search = (
            search
            # Avoid query bounce problem
            .with_preference_param(preference)
            # Add document version to ES response
            .params(version=True)
        )

        # Extras
        extras = {}
        if not lt_es7:
            extras["track_total_hits"] = True
        search = search.extra(**extras)

        return search

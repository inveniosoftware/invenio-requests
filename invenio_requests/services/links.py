# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
# Copyright (C) 2025 Northwestern University.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Utility for rendering URI template links."""

from invenio_records_resources.services import EndpointLink


class RequestEndpointLink(EndpointLink):
    """Shortcut for writing request links."""

    def __init__(self, *args, **kwargs):
        """Constructor."""
        # make sure `params` argument contains "id"
        params = kwargs.get("params", [])
        kwargs["params"] = list(set(params) | {"id"})
        super().__init__(*args, **kwargs)

    @staticmethod
    def vars(record, vars):
        """Update vars used to expand the link."""
        vars.update({"id": record.id})


class RequestTypeEndpointLink(EndpointLink):
    """EndpointLink for generic request that delegates to RequestType's.

    The Requests API (/requests/...) needs to return links that sometimes
    depend on the type of Request. RequestTypeEndpointLink allows that
    by delegating the link to be rendered to one defined in the RequestType
    (where such responsibility should reside) under
    `endpoints_item = {<key>: ...}`.

    Assumes the constructor's `params` are same across endpoints of
    RequestTypes.
    """

    def __init__(self, key, when=None, vars=None, params=None, anchor=None):
        """Constructor."""
        self._key = key
        self._when_func = when
        self._vars_func = vars
        self._params = params or []
        self._anchor_func = anchor or (lambda obj, vars: None)

    def should_render(self, obj, context):
        """Determine if the link should be rendered."""
        # Using getattr because it may not be defined on the type yet
        # (as the codebase transitions to this approach)
        endpoints_item_of_type = getattr(obj.type, "endpoints_item", None)
        if not endpoints_item_of_type:
            return False
        endpoint = endpoints_item_of_type.get(self._key)
        if not endpoint:
            return False
        endpoint_link = self._generate_endpoint_link(endpoint)
        return endpoint_link.should_render(obj, context)

    def expand(self, obj, context):
        """Expand/render the endpoint defined on the RequestType."""
        # This function is gated by should_render so can use attribute directly
        endpoint = obj.type.endpoints_item[self._key]
        endpoint_link = self._generate_endpoint_link(endpoint)
        return endpoint_link.expand(obj, context)

    def _generate_endpoint_link(self, endpoint):
        """Generate EndpointLink used under the hood."""
        return EndpointLink(
            endpoint,
            when=self._when_func,
            vars=self._vars_func,
            params=self._params,
            anchor=self._anchor_func,
        )


class RequestTypeEndpointLinkFromEvent(RequestTypeEndpointLink):
    """EndpointLink for generic request event that delegates to RequestType's.

    The Request Events API (/requests/.../comments) needs to return links that
    sometimes depend on the type of Request. This class allows that
    by delegating the link to be rendered to one defined in the RequestType
    (where such responsibility should reside) under
    `links_item = {<key>: ...}`.

    Assumes the constructor's `params` are same across endpoints of
    RequestTypes.
    """

    def should_render(self, obj, context):
        """Determine if the link should be rendered."""
        request_type = context.get("request_type")
        if not request_type:
            return False
        endpoints_item_of_type = getattr(request_type, "endpoints_item", None)
        if not endpoints_item_of_type:
            return False
        endpoint = endpoints_item_of_type.get(self._key)
        if not endpoint:
            return False
        endpoint_link = self._generate_endpoint_link(endpoint)
        return endpoint_link.should_render(obj, context)

    def expand(self, obj, context):
        """Expand/render the endpoint defined on the RequestType."""
        # This function is gated by should_render so can use attribute directly
        endpoint = context["request_type"].endpoints_item[self._key]
        endpoint_link = self._generate_endpoint_link(endpoint)
        return endpoint_link.expand(obj, context)


class RequestEventTypeEndpointLink(EndpointLink):
    """EndpointLink delegating to one at `key` in RequestEventType."""

    def __init__(self, key, **kwargs):
        """Constructor."""
        self._key = key

    def should_render(self, obj, context):
        """Determine if the link should be rendered.

        :params obj: RequestEvent
        """
        links = getattr(obj.type, "links_item", None)
        if not links:
            return False
        endpoint_link = links.get(self._key)
        if not endpoint_link:
            return False
        return endpoint_link.should_render(obj, context)

    def expand(self, obj, context):
        """Expand/render the endpoint defined on the RequestType.

        :params obj: RequestEvent
        """
        # This function is gated by should_render so can use attribute directly
        endpoint_link = obj.type.links_item[self._key]
        return endpoint_link.expand(obj, context)


class RequestCommentsEndpointLink(EndpointLink):
    """Render links for a Request's Comments (Events).

    Note that the RequestCommentsResource uses RequestEventsService.
    """

    def __init__(self, *args, **kwargs):
        """Constructor."""
        params = kwargs.get("params", [])
        kwargs["params"] = list(set(params) | {"request_id"})
        super().__init__(*args, **kwargs)

    @staticmethod
    def vars(record, vars):
        """Update vars used to expand the link."""
        vars.update({"request_id": record.id})


class RequestCommentEndpointLink(EndpointLink):
    """Render links for a Request's Comment (Event)."""

    def __init__(self, *args, **kwargs):
        """Constructor."""
        params = kwargs.get("params", [])
        kwargs["params"] = list(set(params) | {"request_id", "comment_id"})
        super().__init__(*args, **kwargs)

    @staticmethod
    def vars(obj, vars):
        """Update vars used to expand the link."""
        vars.update({"request_id": obj.request_id, "comment_id": obj.id})


class ActionsEndpointLinks:
    """Renders action links.

    This is EndpointLink-input-interface compliant, but renders a dict of
    links. That's why we don't inherit from it directly.
    """

    def __init__(self, endpoint_link):
        """Constructor."""
        self._endpoint_link = endpoint_link

    def should_render(self, obj, context):
        """Always renders to keep with previous/existing interface.

        Previous interface will render `"actions": {}` so we always want to
        at least render {}.
        """
        return True

    def expand(self, obj, context):
        """Expand the endpoints.

        :param obj: Request
        :param context: dict of context data
        """
        links = {}
        request = obj

        for action in request.type.available_actions:
            if action in [request.type.create_action, request.type.delete_action]:
                continue
            ctx = context.copy()
            ctx["action"] = action
            if self._endpoint_link.should_render(request, ctx):
                links[action] = self._endpoint_link.expand(request, ctx)

        return links

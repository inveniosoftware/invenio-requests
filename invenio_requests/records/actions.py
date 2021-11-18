# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""RequestActions define code to be executed when performing actions on requests."""


from invenio_access.permissions import system_process

from ..errors import CannotExecuteActionError


class RequestAction:
    """Base class for actions on requests."""

    def __init__(self, request):
        """Constructor."""
        self.request = request

    def can_execute(self, identity):
        """Check whether the action can be executed.

        This is mostly intended to be a hook for checking prerequisites
        (think, for instance, CI/CD pipeline runs).
        :param identity: The identity of the executor.
        :return: True if the action can be executed, False otherwise.
        """
        return True

    def execute(self, identity):
        """Execute the request action.

        :param identity: The identity of the executor.
        """
        # probably want to do something with self.request.topic
        if not self.can_execute(identity):
            action_name = type(self).__name__
            raise CannotExecuteActionError(action_name)

    def post_execute(self, identity):
        """Post-run hook that is run after the action has completed successfully.

        This hook should only be executed when the general workflow of the action
        has completed successfully.
        As such, it can be used to index records, for instance.
        """
        pass


class SubmitAction(RequestAction):
    """Submit a request."""

    def can_execute(self, identity):
        """Check whether the action can be executed."""
        return self.request.status == "draft"

    def execute(self, identity):
        """Execute the request action."""
        self.request.status = "open"


class AcceptAction(RequestAction):
    """Decline a request."""

    def can_execute(self, identity):
        """Check whether the action can be executed."""
        return self.request.status == "open"

    def execute(self, identity):
        """Execute the request action."""
        self.request.status = "accepted"


class DeclineAction(RequestAction):
    """Decline a request."""

    def can_execute(self, identity):
        """Check whether the action can be executed."""
        return self.request.status == "open"

    def execute(self, identity):
        """Execute the request action."""
        self.request.status = "declined"


class CancelAction(RequestAction):
    """Cancel a request."""

    def can_execute(self, identity):
        """Check whether the action can be executed."""
        return self.request.status == "open"

    def execute(self, identity):
        """Execute the request action."""
        self.request.status = "cancelled"


class ExpireAction(RequestAction):
    """Expire a request."""

    def can_execute(self, identity):
        """Check whether the action can be executed."""
        is_system_process = system_process in identity.provides
        return self.request.is_open and is_system_process

    def execute(self, identity):
        """Execute the request action."""
        self.request.status = "expired"

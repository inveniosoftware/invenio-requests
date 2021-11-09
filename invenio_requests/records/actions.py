# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.


class RequestAction:
    """Base class for actions on requests."""

    def __init__(self, request):
        self.request = request

    def can_execute(self, executor):
        """Check whether the action can be executed.

        This is mostly intended to be a hook for checking prerequisites
        (think, for instance, CI/CD pipeline runs).
        :param executor: The identity of the executor.
        :return: True if the action can be executed, False otherwise.
        """
        return True

    def execute(self, executor):
        """Execute the request action.

        :param executor: The identity of the executor.
        """
        # probably want to do something with self.request.subject
        if not self.can_execute(executor):
            raise Exception()


class AcceptAction(RequestAction):
    """Decline a request."""

    def can_execute(self, executor):
        return self.request.is_open

    def execute(self, executor):
        self.request.status = "accepted"


class DeclineAction(RequestAction):
    """Decline a request."""

    def can_execute(self, executor):
        return self.request.is_open

    def execute(self, executor):
        self.request.status = "declined"


class CancelAction(RequestAction):
    """Cancel a request."""

    def can_execute(self, executor):
        return self.request.is_open

    def execute(self, executor):
        self.request.status = "cancelled"

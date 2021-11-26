# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test the type registry."""

import pytest

from invenio_requests.registry import TypeRegistry


class TypeA:
    """A test type ('a')."""

    type_id = "a"


class TypeA2:
    """Another test type ('a')."""

    type_id = "a"


class TypeB:
    """Another test type ('b')."""

    type_id = "b"


def test_register():
    """Test the type registration method."""
    reg = TypeRegistry([TypeA])
    assert reg.lookup("a") is TypeA

    # per default, don't override already registered types
    reg.register_type(TypeA2)
    assert reg.lookup("a") is TypeA

    # need to force it in
    reg.register_type(TypeA2, force=True)
    assert reg.lookup("a") is TypeA2

    # register a new type
    assert reg.lookup("b", quiet=True) is None
    reg.register_type(TypeB)
    assert reg.lookup("b", quiet=True) is TypeB


def test_lookup():
    """Test the type lookup method."""
    reg = TypeRegistry([TypeA])
    assert reg.lookup("a") is TypeA

    # with quiet, should return the default value
    assert reg.lookup("b", quiet=True) is None
    assert reg.lookup("b", quiet=True, default="n/a") == "n/a"

    # without the quiet argument, should raise an error
    with pytest.raises(KeyError):
        reg.lookup("b", quiet=False)


def test_iter():
    """Test the iterator."""
    reg = TypeRegistry([TypeA])
    assert list(reg) == [TypeA]
    reg.register_type(TypeB)
    assert list(reg) == [TypeA, TypeB]

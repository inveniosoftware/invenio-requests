# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Tests for the provided customization mechanisms."""

from invenio_requests.customizations.default import DefaultRequestType


class CustomizedReferenceRequestType(DefaultRequestType):
    """Custom request type with different set of allowed reference types."""

    type_id = "customized-reference-request"

    allowed_creator_ref_types = ["community"]
    allowed_receiver_ref_types = ["role", "user"]
    allowed_topic_ref_types = ["record"]


def assert_nested_field_allows_type_key(schema, field_name, type_key, negated=False):
    """Assert that the nested field allows a type key."""
    is_in = type_key in schema._declared_fields[field_name].nested._declared_fields
    return negated != is_in


def test_customized_reference_types(app):
    """Test if the marshmallow schema customization for entity refs works."""
    example_request_data = {
        "created_by": {"user": "1"},
        "receiver": {"user": "2"},
        "topic": None,
    }
    example_request_data_2 = {
        "created_by": {"community": "blr"},
        "receiver": {"role": "admin"},
        "topic": {"record": "1234-abcd"},
    }

    # check if the default schema accepts the first dataset but rejects the second
    schema = DefaultRequestType.marshmallow_schema()
    assert_nested_field_allows_type_key(schema, "created_by", "community", negated=True)
    assert_nested_field_allows_type_key(schema, "receiver", "role", negated=True)
    assert_nested_field_allows_type_key(schema, "topic", "record", negated=True)
    errors = schema().validate(example_request_data)
    assert not errors
    errors = schema().validate(example_request_data_2)
    assert errors

    # check if the customized schema accepts the second dataset but rejects the first
    schema = CustomizedReferenceRequestType.marshmallow_schema()
    assert_nested_field_allows_type_key(schema, "created_by", "community")
    assert_nested_field_allows_type_key(schema, "receiver", "role")
    assert_nested_field_allows_type_key(schema, "receiver", "user")
    assert_nested_field_allows_type_key(schema, "topic", "record")
    errors = schema().validate(example_request_data)
    assert errors
    errors = schema().validate(example_request_data_2)
    assert not errors

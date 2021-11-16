# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-Requests is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Base class for entity resolvers."""


class EntityResolver:
    """A utility for resolving entities referenced by reference dictionaries.

    Reference (agent-style) dictionaries are dicts following the structure
    `{"TYPE": "ID"}` (e.g. `{"user": "1"}`) and are often used in the JSON data
    of Record-like objects in Invenio to reference entities such as record owners.
    """

    ENTITY_TYPE_KEY = None
    """The TYPE key that this resolver is able to resolve.

    This value is used for checking if the resolver is able to resolve the entity
    referenced in the reference dictionaries.
    It is also used for dumping entity references to reference dictionaries.
    """

    ENTITY_TYPE_CLASS = None
    """The entity class that this resolver is responsible for.

    The value of this property is used to perform the checks if a given resolver is
    able to dump a reference to an entity.
    """

    def _get_type(self, reference_dict, strict=False):
        """Get the TYPE part of the reference dict.

        The `strict` parameter controls if the number of keys in the reference dict
        is checked strictly or not.
        """
        keys = list(reference_dict.keys())

        if strict and len(keys) != 1:
            raise ValueError(
                "reference dicts may only have one property! "
                f"offending dict: {reference_dict}"
            )

        if keys:
            return keys[0]

        return None

    def _get_id(self, reference_dict, strict=False):
        """Get the ID part of the reference dict.

        The `strict` parameter controls if the number of keys in the reference dict
        is checked strictly or not.
        """
        type_ = self._get_type(reference_dict, strict=strict)
        if type_ is None:
            return None

        return reference_dict[type_]

    def matches_dict(self, reference_dict, raise_=False):
        """Check if the given reference dict matches for this resolver.

        This includes a check if the reference dict has a shape that's compatible with
        this resolver (i.e. it is of the form `{ENTITY_TYPE_KEY: id}`).
        If the dict does not match and the `raise_` parameter is set, a `ValueError`
        will be raised.
        Otherwise, a boolean value indicating the success of the check will be returned.
        """
        if reference_dict is None:
            return False

        type_ = self._get_type(reference_dict)

        if self.ENTITY_TYPE_KEY != type_:
            if raise_:
                raise ValueError(
                    f"This resolver can only resolve '{self.ENTITY_TYPE_KEY}' "
                    f"references but got '{self._get_type(reference_dict)}'"
                )
            else:
                return False

        return True

    def do_resolve(self, reference_dict):
        """Perform the resolve operation of the entity referenced by the dict.

        NOTE:
        If the default behavior is not desired (e.g. the simple query logic is too
        simple, which could be the case for Records referenced via PID), this method
        should be overridden in the subclass.
        """
        return self.ENTITY_TYPE_CLASS.query.get(self._get_id(reference_dict))

    def resolve(self, reference_dict, check=True):
        """Check compatibility and resolve the entity referenced by the given dict.

        This method will check the TYPE part of the given reference_dict against the
        ENTITY_TYPE_KEY and resolve the entity via `do_resolve(...)`.
        """
        if check:
            self.matches_dict(reference_dict, raise_=True)

        return self.do_resolve(reference_dict)

    def matches_entity(self, entity, raise_=False):
        """Check if this resolver can dump a reference to the given entity.

        This is done by an instance check of the entity against the set
        `ENTITY_TYPE_CLASS`.
        If the entity's class does not match and the `raise_` parameter is set, a
        `ValueError` will be raised.
        Otherwise, a boolean value indicating the success of the check will be returned.
        """
        if not isinstance(entity, self.ENTITY_TYPE_CLASS):
            if raise_:
                raise ValueError(
                    f"This resolver can only create references to "
                    f"'{self.ENTITY_TYPE_CLASS}' entities but got type "
                    f"'{type(entity)}'"
                )

            else:
                return False

        return True

    def create_reference(self, entity):
        """Perform the reference dumping operation of the given entity.

        NOTE:
        If the default behavior is not desired (i.e. the ID to be dumped should
        be different from `entity.id`), this method should be overridden in the
        subclass.
        """
        return {self.ENTITY_TYPE_KEY: str(entity.id)}

    def reference(self, entity, check=True):
        """Check compatibility and create a reference dict for the given entity.

        This method will perform an instance check of the given entity against the
        `ENTITY_TYPE_CLASS` before calling `create_reference(...)`.
        """
        if check:
            self.matches_entity(entity, raise_=True)

        return self.create_reference(entity)

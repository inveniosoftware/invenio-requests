..
    Copyright (C) 2021-2024 CERN.
    Copyright (C) 2024-2025 Graz University of Technology.

    Invenio-Requests is free software; you can redistribute it and/or
    modify it under the terms of the MIT License; see LICENSE file for more
    details.

Changes
=======

Version v7.2.1 (released 2025-07-22)

- fix: notification not sent if user has an empty profile

Version v7.2.0 (released 2025-07-17)

- i18n: pulled translations

Version v7.1.0 (released 2025-07-14)

- chores: replaced importlib_xyz with importlib
- i18n: push translations
- i18n: run js compile catalog
- i18n: run js extract msgs
- i18n: refactor compile catalog
- i18n: force pull translations
- i18n: extract py msgs

Version v7.0.0 (released 2025-06-03)

- setup: bump major dependencies

Version v6.3.0 (released 2025-05-15)

- MathJax: use async typesetting
- fix: extra filter not needed param
- services: include Opensearch meta in the results
- fix: RemovedInMarshmallow4Warning

Version v6.2.0 (released 2025-04-08)

- i18n: Fix untranslated strings in facets
- notifications: exclude system_user
- fix: setuptools require underscores instead of dashes
- i18n: removed deprecated messages
- message-index: remove depreciated languages
- ui: added theme class to request labels

Version v6.1.1 (released 2025-03-12)

- search: make shared filters toggleable

Version v6.1.0 (released 2025-03-11)

- feature: add Topic generator for request types. That enables granting permissions to users based on the topic of the request.
- requests: split mine and shared with me
- adds `shared_with_me` param to filter requests
- adds dashboard dropdown to filter requests
- adds topic generator on `can_read` request permission

Version v6.0.0 (released 2025-02-13)

- Promote to stable release.

Version v6.0.0.dev2 (released 2025-01-23)

Version v6.0.0.dev1 (released 2024-12-12)

- fix: sqlalchemy.exc.ArgumentError
- comp: make compatible to flask-sqlalchemy>=3.1
- setup: bump major dependencies

Version v5.5.0 (released 2024-12-09)

- config: allow comment notification builder to be custom

Version v5.4.0 (released 2024-11-26)

- UI: add seperator on list of requests
- ui: add subcommunity invitation facet and label
- ux: set tab title to request title
- requests: add missing facets and reorder

Version 5.3.0 (released 2024-11-15)

- actions: allows passing kwargs to execute_action, so that custom behaviour
  can be implemented in each action
- translations: include Jinja templates in translations

Version 5.2.0 (released 2024-10-10)

- webpack: update axios major version

Version 5.1.1 (released 2024-10-02)

- views: add callback hook on search results rendered

Version 5.1.0 (released 2024-09-17)

- assets: add mathjax support to timeline comments

Version 5.0.0 (released 2024-08-22)

- bump invenio-users-resources with breaking changes

Version 4.7.0 (released 2024-08-09)

- resources: accept vnd.inveniordm.v1+json header
- conversation: fix comment editor

Version 4.6.0 (released 2024-07-28)

- comments: fix jumping cursor
- ui: add community membership request label type

Version 4.5.1 (released 2024-06-28)

- service: fix request ID passing

Version 4.5.0 (released 2024-06-28)

- service: handle request parameters flexibly

Version 4.4.0 (released 2024-06-27)

- registry: allow entry points to be callables

Version 4.3.0 (released 2024-06-25)

- contrib: added subcommunity type label.
- config: allow request search configuration

Version 4.2.0 (released 2024-06-04)

- installation: major bump on invenio-records-resources

Version 4.1.0 (released 2024-03-23)

- mappings: change "dynamic" values to string
- ui: handle default case for EntityDetails (bug)
- ui: add group for EntityDetails
- init: move record_once to finalize_app

Version 4.0.0 (released 2024-02-19)

- major bump on invenio-users-resources

Version 3.0.1 (released 2024-02-16)

- calculated: make easier to support backwards compatibility

Version 3.0.0 (released 2024-01-31)

- installation: bump records-resources and users-resources

Version 2.14.7 (2023-12-12)

- replace ckeditor with tinymce due to license issue

Version 2.14.6 (2023-12-11)

- request metadata: add record link

Version 2.14.5 (2023-10-25)

- assets: update email styling

Version 2.14.4 (2023-10-18)

- assets: improve quote replies styling

Version 2.14.3 (2023-10-06)

- notifications: update comment notification to work with email

Version 2.14.2 (2023-09-25)

- a11y: added label for context menu

Version 2.14.1 (2023-09-22)

- a11y: add aria-label to accept request modal

Version 2.14.0 (2023-09-14)

- ui: support community manage record request facets and labels
- icons: Update icons

Version 2.13.0 (2023-09-13)

- resource: add configurable error handlers
- permissions: fix delete bug

Version 2.12.0 (2023-09-11)

* administration: custom overridable search item display
* chore: eslint formatting
* setup: upgrade invenio-users-resources

Version 2.11.2 (2023-09-04)

- assets: fix missing guest user avatar

Version 2.11.1 (2023-08-30)

- assets: configurable icons per request type

Version 2.11.0 (2023-08-24)

- types: add configurable request payload schema
- components: add payload controlling component

Version 2.10.1 (2023-08-23)

- tasks: add moderation creation

Version 2.10.0 (2023-08-21)

- moderation: restrict request duplication

Version 2.9.2 (2023-08-17)

- access request: update guest request payload
- access request: fix ui bugs

Version 2.9.1 (2023-08-09)

- ui: small improvement

Version 2.9.0 (2023-08-02)

- user moderation: add new request type, service and resource

Version 2.8.0 (2023-07-24)

- requests: add request event notification builder,
            template and recipient filter

Version 2.7.0 (2023-07-21)

- requests: add notification flag to the service

Version 2.6.1 (2023-07-13)

- ui: improve styling in request items

Version 2.6.0 (2023-07-13)

- transifex: update configs
- ui: fix username not appearing
- requests-ui: add rendering of new entity for external emails
- links: add customization of context vars when generating them

Version 2.5.0 (2023-06-30)

- Update translations
- Bump invenio-users-resources

Version 2.4.0 (2023-06-02)

- ui: add icons for deleted communities
- requests resolvers: add system creator

Version 2.3.0 (2023-05-05)

- resolvers: use record-based resolvers and proxies
- resolvers: use request id for resolving
- views: remove explicit service_id from register call

Version 2.2.0 (2023-04-25)

- upgrade invenio-records-resources

Version 2.1.0 (2023-04-20)

- upgrade invenio-records-resources

Version 2.0.0 (2023-03-28)

- add request search components
- add contrib label components
- refactor action components
- refactor relative time component

Version 1.3.0 (2023-03-24)

- bump invenio-records-resources to v2.0.0
- expand: call ghost method for unresolved entities

Version 1.2.0 (released 2023-03-13)

- add inclusion request type to UI support
- distinguish UI labels for request types (inclusion vs review)
- add self_html link to the resource payload

Version 1.1.1 (released 2023-03-09)

- results: add links template setter

Version 1.1.0 (released 2023-03-02)

- remove deprecated flask-babelex imports
- upgrade invenio-theme, invenio-records-resources, invenio-users-resources

Version 1.0.5 (released 2022-12-01)

- Add identity to links template expand method.

Version 1.0.4 (released 2022-11-25)

- add i18n translations.
- use centralized axios configuration.

Version 1.0.3 (released 2022-11-15)

- add `indexer_queue_name` property in service configs
- add the services and indexers in global registry

Version 1.0.2 (released 2022-11-04)

- bump invenio-records-resources version

Version 1.0.1 (released 2022-11-03)

- add mobile components styling

Version 1.0.0

- Initial public release.

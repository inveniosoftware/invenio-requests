# SPDX-FileCopyrightText: 2016-2021 CERN.
# SPDX-License-Identifier: MIT

"""JS/CSS bundles for communities.

You include one of the bundles in a page like the example below (using
``comunities`` bundle as an example):

.. code-block:: html

    {{ webpack['communities.js']}}

"""

from invenio_assets.webpack import WebpackThemeBundle

requests = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                "invenio-requests-base": "./js/invenio_requests/requestsAppInit.js",
            },
            dependencies={
                "semantic-ui-css": "^2.5.0",
                "semantic-ui-react": "^3.0.0-beta.2",
                "@hugerte/hugerte-react": "^2.0.2",
                "hugerte": "^1.0.10",
                "axios": "^1.7.7",
                "lodash": "^4.17.15",
                "luxon": "^1.21.1",
                "path": "^0.12.7",
                "prop-types": "^15.7.2",
                "qs": "^6.9.1",
                "react": "^18.2.1",
                "react-dom": "^18.2.1",
                "yup": "^0.32.11",
                "react-overridable": "^1.0.0",
                "@semantic-ui-react/css-patch": "^1.0.0",
                "redux": "^4.0.5",
                "redux-devtools-extension": "^2.13.8",
                "redux-thunk": "^2.3.0",
                "react-redux": "^7.2.0",
                "i18next": "^20.3.0",
                "i18next-browser-languagedetector": "^6.1.0",
                "react-i18next": "^11.11.0",
            },
            aliases={
                "@translations/invenio_requests": "translations/invenio_requests",
                "@js/invenio_requests": "js/invenio_requests",
            },
        ),
    },
)

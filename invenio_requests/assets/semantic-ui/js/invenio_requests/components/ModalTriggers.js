/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import { AppMedia } from "@js/invenio_theme/Media";
import { i18next } from "@translations/invenio_requests/i18next";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
import {
  RequestAcceptButton,
  RequestSubmitButton,
  RequestCancelButton,
  RequestDeclineButton,
} from "./Buttons";

const { MediaContextProvider, Media } = AppMedia;

// components for most common actions, used in other modules, not explicitly in invenio-requests

const requestDeclineModalTriggerDefaultPropAriaAttributes = {};
export const RequestDeclineModalTrigger = ({
  onClick,
  loading = false,
  ariaAttributes = requestDeclineModalTriggerDefaultPropAriaAttributes,
  size = "mini",
  className = "ml-5",
}) => {
  return (
    <MediaContextProvider>
      <Media greaterThanOrEqual="tablet">
        <RequestDeclineButton
          onClick={onClick}
          loading={loading}
          disabled={loading}
          size={size}
          className={className}
          {...ariaAttributes}
        />
      </Media>
      <Media at="mobile">
        <Dropdown.Item
          icon={{
            name: "cancel",
            color: "negative",
            className: "mr-5",
          }}
          onClick={onClick}
          content={i18next.t("Decline")}
        />
      </Media>
    </MediaContextProvider>
  );
};

RequestDeclineModalTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

const requestAcceptModalTriggerDefaultPropAriaAttributes = {};
export const RequestAcceptModalTrigger = ({
  onClick,
  requestType,
  loading = false,
  ariaAttributes = requestAcceptModalTriggerDefaultPropAriaAttributes,
  size = "mini",
  className = "ml-5",
}) => {
  let text; // logic duplicated from Buttons.js for Dropdown text
  switch (requestType) {
    case "community-submission":
      text = i18next.t("Accept and publish");
      break;
    case "record-deletion":
      text = i18next.t("Accept and delete");
      break;
    default:
      text = i18next.t("Accept");
  }
  return (
    <MediaContextProvider>
      <Media greaterThanOrEqual="tablet">
        <RequestAcceptButton
          onClick={onClick}
          loading={loading}
          disabled={loading}
          requestType={requestType}
          size={size}
          className={className}
          {...ariaAttributes}
        />
      </Media>
      <Media at="mobile">
        <Dropdown.Item
          icon={{
            name: "checkmark",
            color: "positive",
            className: "mr-5",
          }}
          onClick={onClick}
          content={text}
        />
      </Media>
    </MediaContextProvider>
  );
};

RequestAcceptModalTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
  requestType: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

const requestCancelModalTriggerDefaultPropAriaAttributes = {};
export const RequestCancelModalTrigger = ({
  onClick,
  loading = false,
  ariaAttributes = requestCancelModalTriggerDefaultPropAriaAttributes,
  size = "mini",
  className = "ml-5",
}) => {
  return (
    <MediaContextProvider>
      <Media greaterThanOrEqual="tablet">
        <RequestCancelButton
          content={i18next.t("Cancel")}
          onClick={onClick}
          loading={loading}
          disabled={loading}
          size={size}
          className={className}
          negative={false}
          {...ariaAttributes}
        />
      </Media>
      <Media at="mobile">
        <Dropdown.Item
          icon={{
            name: "cancel",
            className: "neutral mr-5",
          }}
          onClick={onClick}
          content={i18next.t("Cancel")}
        />
      </Media>
    </MediaContextProvider>
  );
};

RequestCancelModalTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

const requestSubmitModalTriggerDefaultPropAriaAttributes = {};
export const RequestSubmitModalTrigger = ({
  onClick,
  requestType,
  loading = false,
  ariaAttributes = requestSubmitModalTriggerDefaultPropAriaAttributes,
  size = "mini",
  className = "ml-5",
}) => {
  const text = i18next.t("Request access");
  return (
    <MediaContextProvider>
      <Media greaterThanOrEqual="tablet">
        <RequestSubmitButton
          onClick={onClick}
          loading={loading}
          disabled={loading}
          requestType={requestType}
          size={size}
          className={className}
          {...ariaAttributes}
        />
      </Media>
      <Media at="mobile">
        <Dropdown.Item
          icon={{
            name: "unlock alternate",
            color: "positive",
            className: "mr-5",
          }}
          onClick={onClick}
          content={text}
        />
      </Media>
    </MediaContextProvider>
  );
};

RequestSubmitModalTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
  requestType: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

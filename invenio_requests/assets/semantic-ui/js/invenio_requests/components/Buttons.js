/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-FileCopyrightText: 2024 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */
import { i18next } from "@translations/invenio_requests/i18next";
import { forwardRef, useEffect } from "react";
import { Button } from "semantic-ui-react";
import PropTypes from "prop-types";

// components for most common actions, used in other modules, not explicitly in invenio-requests

export const SaveButton = (props) => (
  <Button
    icon="save"
    labelPosition="left"
    positive
    size="mini"
    content={i18next.t("Save")}
    {...props}
  />
);

const requestDeclineButtonDefaultPropAriaAttributes = {};
export const RequestDeclineButton = ({
  onClick,
  loading = false,
  ariaAttributes = requestDeclineButtonDefaultPropAriaAttributes,
  size = "mini",
  className = "",
}) => {
  return (
    <Button
      icon="cancel"
      labelPosition="left"
      content={i18next.t("Decline")}
      onClick={onClick}
      loading={loading}
      disabled={loading}
      negative
      size={size}
      className={className}
      {...ariaAttributes}
    />
  );
};

RequestDeclineButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

const requestAcceptButtonDefaultPropAriaAttributes = {};
export const RequestAcceptButton = ({
  onClick,
  requestType,
  loading = false,
  ariaAttributes = requestAcceptButtonDefaultPropAriaAttributes,
  size = "mini",
  className = "",
}) => {
  let buttonText;
  switch (requestType) {
    case "community-submission":
      buttonText = i18next.t("Accept and publish");
      break;
    case "record-deletion":
      buttonText = i18next.t("Accept and delete");
      break;
    default:
      buttonText = i18next.t("Accept");
  }
  return (
    <Button
      icon="checkmark"
      labelPosition="left"
      content={buttonText}
      onClick={onClick}
      positive
      loading={loading}
      disabled={loading}
      size={size}
      className={className}
      {...ariaAttributes}
    />
  );
};

RequestAcceptButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  requestType: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
};

export const CancelButton = forwardRef((props, ref) => {
  useEffect(() => {
    ref?.current?.focus();
  }, [ref]);

  return (
    <Button
      ref={ref}
      icon="cancel"
      labelPosition="left"
      content={i18next.t("Cancel")}
      size="mini"
      {...props}
    />
  );
});

CancelButton.displayName = "CancelButton";

const requestCancelButtonDefaultPropAriaAttributes = {};
export const RequestCancelButton = ({
  onClick,
  loading = false,
  ariaAttributes = requestCancelButtonDefaultPropAriaAttributes,
  size = "mini",
  content = i18next.t("Cancel request"),
  className = "",
  negative = true,
}) => {
  return (
    <Button
      icon="cancel"
      labelPosition="left"
      content={content}
      onClick={onClick}
      loading={loading}
      disabled={loading}
      size={size}
      negative={negative}
      className={className}
      {...ariaAttributes}
    />
  );
};

RequestCancelButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  content: PropTypes.string,
  className: PropTypes.string,
  negative: PropTypes.bool,
};

const requestSubmitButtonDefaultPropAriaAttributes = {};
export const RequestSubmitButton = ({
  onClick,
  loading = false,
  ariaAttributes = requestSubmitButtonDefaultPropAriaAttributes,
  size = "mini",
  content = i18next.t("Request access"),
  className = "",
}) => {
  return (
    <Button
      icon="unlock alternate"
      labelPosition="left"
      content={i18next.t("Request access")}
      onClick={onClick}
      positive
      loading={loading}
      disabled={loading}
      size={size}
      className={className}
      {...ariaAttributes}
    />
  );
};

RequestSubmitButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  content: PropTypes.string,
  className: PropTypes.string,
};

const requestLockButtonDefaultPropAriaAttributes = {};
export const RequestLockButton = ({
  onClick,
  loading = false,
  ariaAttributes = requestLockButtonDefaultPropAriaAttributes,
  size = "small",
  className = "request-lock-button",
  content,
  icon,
}) => {
  return (
    <Button
      icon={icon}
      onClick={onClick}
      content={content}
      loading={loading}
      disabled={loading}
      size={size}
      fluid
      className={className}
      {...ariaAttributes}
    />
  );
};

RequestLockButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ariaAttributes: PropTypes.object,
  size: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

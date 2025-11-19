// This file is part of InvenioRequests
// Copyright (C) 2025 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
import React from "react";
import PropTypes from "prop-types";
import { Message, Icon } from "semantic-ui-react";
import {
  DRAFT_STATUS_ERROR,
  DRAFT_STATUS_SUCCESS,
} from "../timelineCommentEditor/state/reducer";
import { i18next } from "@translations/invenio_requests/i18next";

export const TimelineDraftSavingStatus = ({ status }) => {
  const message =
    status === DRAFT_STATUS_SUCCESS
      ? i18next.t("Comment draft saved")
      : status === DRAFT_STATUS_ERROR
      ? i18next.t("Comment draft could not be saved")
      : null;

  if (!message) return null;
  return (
    <Message
      size="tiny"
      className="mt-0"
      success={status === DRAFT_STATUS_SUCCESS}
      negative={status === DRAFT_STATUS_ERROR}
      compact
    >
      <Icon name="check circle" />
      {message}
    </Message>
  );
};

TimelineDraftSavingStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

TimelineDraftSavingStatus.defaultProps = {};

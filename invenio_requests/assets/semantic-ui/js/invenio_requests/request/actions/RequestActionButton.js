/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-FileCopyrightText: 2024 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Button } from "semantic-ui-react";

export const RequestActionButton = ({
  action,
  handleActionClick,
  loading,
  className = "",
  size = "medium",
  requestType,
}) => {
  return (
    <Overridable
      id={`RequestActionButton.${action}`}
      onClick={handleActionClick}
      loading={loading}
      className={className}
      size={size}
    >
      <Button
        onClick={handleActionClick}
        loading={loading}
        className={className}
        size={size}
        requestType={requestType}
      >
        {action}
      </Button>
    </Overridable>
  );
};

RequestActionButton.propTypes = {
  action: PropTypes.string.isRequired,
  handleActionClick: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  className: PropTypes.string,
  size: PropTypes.string,
  requestType: PropTypes.string.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestActionButton",
  RequestActionButton
);

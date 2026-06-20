/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Label } from "semantic-ui-react";

class RequestTypeLabel extends Component {
  render() {
    const { type } = this.props;
    return (
      <Overridable id={`RequestTypeLabel.layout.${type}`}>
        <Label>{type}</Label>
      </Overridable>
    );
  }
}

RequestTypeLabel.propTypes = {
  type: PropTypes.string.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestTypeLabel",
  RequestTypeLabel
);

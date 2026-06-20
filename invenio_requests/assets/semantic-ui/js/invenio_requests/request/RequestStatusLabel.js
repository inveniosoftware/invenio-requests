/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Label } from "semantic-ui-react";

class RequestStatusLabel extends Component {
  render() {
    const { status } = this.props;
    return (
      <Overridable id={`RequestStatusLabel.layout.${status}`}>
        <Label>{status}</Label>
      </Overridable>
    );
  }
}

RequestStatusLabel.propTypes = {
  status: PropTypes.string.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestStatusLabel",
  RequestStatusLabel
);

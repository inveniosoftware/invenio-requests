/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Icon } from "semantic-ui-react";

export class RequestTypeIcon extends Component {
  render() {
    const { type } = this.props;
    return (
      <Overridable id={`InvenioRequests.RequestTypeIcon.layout.${type}`}>
        <Icon name="plus" className="neutral" />
      </Overridable>
    );
  }
}

RequestTypeIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestTypeIcon",
  RequestTypeIcon
);

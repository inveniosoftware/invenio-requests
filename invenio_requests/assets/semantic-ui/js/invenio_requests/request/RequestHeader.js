import { Divider } from "semantic-ui-react";
import { RequestTopic } from "./RequestTopic";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";

class RequestHeader extends Component {
  render() {
    const { request } = this.props;
    return (
      <Overridable id="InvenioRequests.RequestHeader" {...this.props}>
        {request.topic.metadata && (
          <>
            <RequestTopic requestType={request.type} topic={request.topic} />
            <Divider hidden />
          </>
        )}
      </Overridable>
    );
  }
}

RequestHeader.propTypes = {
  request: PropTypes.object.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestHeader",
  RequestHeader
);

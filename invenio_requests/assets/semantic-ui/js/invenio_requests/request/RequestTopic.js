import { buildRequestTypeUID } from "../customizations/utils";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";

export const RequestTopic = ({ requestType, topic, overridableId }) => {
  return (
    <Overridable
      id={buildRequestTypeUID("RequestTopic.layout", requestType, overridableId)}
      requestType={requestType}
      topic={topic}
    >
    </Overridable>
  );
};

RequestTopic.propTypes = {
  requestType: PropTypes.string.isRequired,
  topic: PropTypes.object.isRequired,
  overridableId: PropTypes.string,
};

RequestTopic.defaultProps = {
  overridableId: "",
};

export default Overridable.component("RequestTopic", RequestTopic);

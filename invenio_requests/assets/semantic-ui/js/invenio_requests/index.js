import RequestTopicRecord
  from './customizations/RequestTopicRecord';
import { InvenioRequestsTimelineAPI } from "./api/api";
import React from "react";
import ReactDOM from "react-dom";
import { InvenioRequestsApp } from "./InvenioRequestsApp";

const requestDetailsDiv = document.getElementById("request-detail");
const request = JSON.parse(requestDetailsDiv.dataset.record);

const overriddenCmps = {
  'RequestTopic.layout.community-submission': RequestTopicRecord,
  // customizable request topic (dynamic ID creation)
  // 'RequestTopic.layout.community-inclusion': RequestTopicUser,
  // 'RequestTopic.layout.community-invitation': RequestTopicCommunity,
}

ReactDOM.render(<InvenioRequestsApp request={request} overriddenCmps={overriddenCmps}/>, requestDetailsDiv);

export { default as RequestDetails } from "./RequestDetails";
export { default as Timeline } from "./timeline/TimelineFeed";
export { default as TimelineEvent } from "./timeline/TimelineEvent";
export { default as RequestMetadata } from "./request/RequestMetadata";
export { default as RequestTopic } from "./request/RequestTopic";
export { default as RequestHeader } from "./request/RequestHeader";
export { InvenioRequestsTimelineAPI } from "./api/api";

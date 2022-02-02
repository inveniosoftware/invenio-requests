import { InvenioRequestsAPI } from "./api/api";
import React from "react";
import ReactDOM from "react-dom";
import { InvenioRequestsApp } from "./InvenioRequestsApp";

const requestDetailsDiv = document.getElementById("request-detail");
const request = JSON.parse(requestDetailsDiv.dataset.record);

ReactDOM.render(<InvenioRequestsApp request={request} />, requestDetailsDiv);

export { default as RequestDetails } from "./RequestDetails";
export { default as Timeline } from "./timeline/TimelineFeed";
export { default as TimelineEvent } from "./timeline/TimelineEvent";
export { InvenioRequestsAPI } from "./api/api";

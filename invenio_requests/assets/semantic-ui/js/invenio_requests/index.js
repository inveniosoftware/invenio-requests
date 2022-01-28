import {
  InvenioRequestsAPI, RequestLinkExtractor,
} from './api/api';
import React from "react";
import ReactDOM from "react-dom";
import { OverridableContext } from "react-overridable";
import RequestDetails from './RequestDetails';

const requestDetailsDiv = document.getElementById("request-detail");
const overriddenCmps = {};
const request = JSON.parse(requestDetailsDiv.dataset.record);
const api = new InvenioRequestsAPI(new RequestLinkExtractor(request.links));

ReactDOM.render(
  <OverridableContext.Provider value={overriddenCmps}>
    <RequestDetails request={request} api={api}/>
   </OverridableContext.Provider>,
  requestDetailsDiv
);

export { default as RequestDetails } from "./RequestDetails";
export { default as Timeline } from "./Timeline";
export { default as TimelineEvent } from "./TimelineEvent";
export { InvenioRequestsAPI } from "./api";

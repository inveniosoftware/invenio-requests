import { InvenioRequestsTimelineAPI, RequestLinkExtractor } from "./api/api";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { configureStore } from "./store";
import { OverridableContext } from "react-overridable";
import RequestDetails from "./RequestDetails";
import { Provider } from "react-redux";

export class InvenioRequestsApp extends Component {
  constructor(props) {
    super(props);
    const { api, request } = this.props;
    const defaultApi = new InvenioRequestsTimelineAPI(
      new RequestLinkExtractor(request.links)
    );

    const apiClient = api ? api : defaultApi;

    const appConfig = {
      "apiClient": apiClient,
      "request": request,
      "refreshIntervalMs": 5000,
    };
    this.store = configureStore(appConfig);
  }

  render() {
    const { overriddenCmps, request } = this.props;
    return (
      <OverridableContext.Provider value={overriddenCmps}>
        <Provider store={this.store}>
          <RequestDetails request={request} />
        </Provider>
      </OverridableContext.Provider>
    );
  }
}

InvenioRequestsApp.propTypes = {
  api: PropTypes.object,
  overriddenCmps: PropTypes.object,
  request: PropTypes.object.isRequired,
};

InvenioRequestsApp.defaultProps = {
  overriddenCmps: { },
  api: null,
};

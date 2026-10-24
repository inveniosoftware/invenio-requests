/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-FileCopyrightText: 2024 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import {
  InvenioRequestsAPI,
  RequestLinksExtractor,
  InvenioRequestEventsApi,
  RequestEventsLinksExtractor,
} from "./api";
import { Request } from "./request";
import { Component } from "react";
import PropTypes from "prop-types";
import { configureStore } from "./store";
import { OverridableContext } from "react-overridable";
import { Provider } from "react-redux";
import { DatasetContext } from "./data";

const invenioRequestsAppDefaultPropOverriddenCmps = {};
export class InvenioRequestsApp extends Component {
  constructor(props) {
    super(props);
    const {
      requestsApi = null,
      requestEventsApi = null,
      dataset: { request, defaultQueryParams, defaultReplyQueryParams, config },
    } = props;

    const defaultRequestsApi = new InvenioRequestsAPI(
      new RequestLinksExtractor(request)
    );
    const defaultRequestEventsApi = (commentLinks) =>
      new InvenioRequestEventsApi(new RequestEventsLinksExtractor(commentLinks));
    const appConfig = {
      requestsApi: requestsApi || defaultRequestsApi,
      request,
      requestEventsApi: requestEventsApi || defaultRequestEventsApi,
      refreshIntervalMs:
        config.timelineRefreshInterval && config.timelineRefreshInterval * 1000,
      defaultQueryParams,
      defaultReplyQueryParams,
    };

    this.store = configureStore(appConfig);
  }

  render() {
    const { overriddenCmps = invenioRequestsAppDefaultPropOverriddenCmps, dataset } =
      this.props;
    const { userAvatar, permissions, config } = dataset;

    return (
      <OverridableContext.Provider value={overriddenCmps}>
        <Provider store={this.store}>
          <DatasetContext.Provider value={dataset}>
            <Request
              userAvatar={userAvatar}
              permissions={permissions}
              config={config}
            />
          </DatasetContext.Provider>
        </Provider>
      </OverridableContext.Provider>
    );
  }
}

InvenioRequestsApp.propTypes = {
  dataset: PropTypes.object.isRequired,
  requestsApi: PropTypes.object,
  requestEventsApi: PropTypes.object,
  overriddenCmps: PropTypes.object,
};

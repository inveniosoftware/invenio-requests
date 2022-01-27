// This file is part of Invenio-requests
// Copyright (C) 2022 CERN.
//
// Invenio-requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";

const apiConfig = {
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
};
const configuredAxios = axios.create(apiConfig);

/**
 * API client response.
 *
 * It's a wrapper/sieve around Axios to contain Axios coupling here. It maps
 * good and bad responses to a unified interface.
 *
 */
export class RequestsApiClientResponse {
  constructor(data, errors, code) {
    this.data = data;
    this.errors = errors;
    this.code = code;
  }
}

/**
 * API Client for requests.
 *
 * It mostly uses the API links passed to it from responses.
 *
 */
export class RequestsApiClient {
  constructor() {
    this.options = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
  }

  /**
   * Wraps the axios call in a uniform response.
   *
   * @param {function} axios_call - Call to wrap
   */
  async _createResponse(axios_call) {
    try {
      let response = await axios_call();
      return new RequestsApiClientResponse(
        response.data,
        response.data.errors,
        response.status
      );
    } catch (error) {
      return new RequestsApiClientResponse(
        error.response.data,
        error.response.data.errors,
        error.response.status
      );
    }
  }

    /**
   * Get a timeline.
   *
   * @param {object} url - timeline url
   * @param {object} options - Custom options
   */
  async timeline(url, options) {
    options = options || {};
    return this._createResponse(() =>
      configuredAxios.get(url, {
        ...this.options,
        ...options,
      })
    );
  }

}

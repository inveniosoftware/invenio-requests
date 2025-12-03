// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_requests/i18next";
import {
  CHANGE_PAGE,
  HAS_ERROR,
  IS_LOADING,
  IS_REFRESHING,
  MISSING_REQUESTED_EVENT,
  SUCCESS,
  APPEND_PAGE,
} from "./actions";

export const initialState = {
  loading: false,
  refreshing: false,
  data: {},
  firstPage: {},
  appendedPage: [],
  lastPage: {},
  error: null,
  size: 15,
  page: 1,
  warning: null,
};

export const timelineReducer = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOADING:
      return { ...state, loading: true };
    case IS_REFRESHING:
      return { ...state, refreshing: true };
    case SUCCESS:
      return {
        ...state,
        refreshing: false,
        loading: false,
        data: action.payload.data || state.data,
        firstPage: action.payload.firstPage || state.firstPage,
        appendedPage: action.payload.appendedPage || state.appendedPage,
        lastPage: action.payload.lastPage || state.lastPage,
        error: null,
      };
      case APPEND_PAGE:
        return {
          ...state,
          appendedPage: [...state.appendedPage, ...action.payload.newHits],
          firstPageCurrent: action.payload.nextPage,
        };
    case HAS_ERROR:
      return {
        ...state,
        refreshing: false,
        loading: false,
        error: action.payload,
      };
    case CHANGE_PAGE:
      return {
        ...state,
        page: action.payload,
        warning: null,
      };
    case MISSING_REQUESTED_EVENT:
      return {
        ...state,
        warning: i18next.t(
          "The requested comment was not found. The first page of comments is shown instead."
        ),
      };

    default:
      return state;
  }
};

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
  firstPage: {}, // Dictionary with hits and total
  afterFirstPageHits: [],
  focusedPage: {}, // Dictionary with hits and total
  afterFocusedPageHits: [],
  lastPage: {}, // Dictionary with hits and total
  error: null,
  size: 15,
  page: 1,
  pageFocused: null,
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
        firstPage: action.payload.firstPage || state.firstPage,
        afterFirstPageHits:
          action.payload.afterFirstPageHits || state.afterFirstPageHits,
        focusedPage: action.payload.focusedPage || state.focusedPage,
        afterFocusedPageHits:
          action.payload.afterFocusedPageHits || state.afterFocusedPageHits,
        lastPage: action.payload.lastPage || state.lastPage,
        pageFocused: action.payload.pageFocused || state.pageFocused,
        error: null,
      };
    case APPEND_PAGE:
      return {
        ...state,
        ...action.payload,
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
        warning: i18next.t("We couldn't find the comment you were looking for."),
      };

    default:
      return state;
  }
};

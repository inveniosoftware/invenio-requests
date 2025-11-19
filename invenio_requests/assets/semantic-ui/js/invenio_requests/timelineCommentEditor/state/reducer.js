// This file is part of InvenioRequests
// Copyright (C) 2022-2025 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  IS_LOADING,
  HAS_ERROR,
  SUCCESS,
  SETTING_CONTENT,
  RESTORE_CONTENT,
  DRAFT_SAVED,
  DRAFT_SAVE_ERROR,
} from "./actions";

export const DRAFT_STATUS_SUCCESS = "success";
export const DRAFT_STATUS_ERROR = "failure";
export const DRAFT_STATUS_NONE = "none";

const initialState = {
  error: null,
  isLoading: false,
  commentContent: "",
  storedCommentContent: null,
  draftSavingStatus: DRAFT_STATUS_NONE,
};

export const commentEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SETTING_CONTENT:
      return { ...state, commentContent: action.payload };
    case IS_LOADING:
      return { ...state, isLoading: true };
    case HAS_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        commentContent: "",
        draftSavingStatus: DRAFT_STATUS_NONE,
      };
    case RESTORE_CONTENT:
      return {
        ...state,
        commentContent: action.payload,
        // We'll never change this later, so it can be used as an `initialValue`
        storedCommentContent: action.payload,
        draftSavingStatus: DRAFT_STATUS_SUCCESS,
      };
    case DRAFT_SAVED:
      return {
        ...state,
        draftSavingStatus: DRAFT_STATUS_SUCCESS,
      };
    case DRAFT_SAVE_ERROR:
      return {
        ...state,
        draftSavingStatus: DRAFT_STATUS_ERROR,
      };
    default:
      return state;
  }
};

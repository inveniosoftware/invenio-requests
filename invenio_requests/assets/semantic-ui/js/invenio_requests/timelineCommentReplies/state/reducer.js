// This file is part of InvenioRequests
// Copyright (C) 2025 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  HAS_ERROR,
  HAS_NEWER_DATA,
  HAS_OLDER_DATA,
  IS_LOADING,
  IS_SUBMITTING,
  REPLY_DELETE_COMMENT,
  REPLY_RESTORE_DRAFT_CONTENT,
  REPLY_SET_DRAFT_CONTENT,
  REPLY_UPDATE_COMMENT,
  SET_PAGE,
} from "./actions";

export const initialState = {
  childComments: {},
  status: {},
};

export const selectCommentChildren = (state, parentRequestEventId) => {
  const { childComments } = state;
  if (Object.prototype.hasOwnProperty.call(childComments, parentRequestEventId)) {
    return childComments[parentRequestEventId];
  } else {
    return [];
  }
};

const initialRepliesStatus = {
  loading: false,
  submitting: false,
  error: null,
  page: 1,
  hasMore: false,
  draftContent: "",
  storedDraftContent: "",
};

export const selectCommentRepliesStatus = (state, parentRequestEventId) => {
  const { status } = state;
  if (Object.prototype.hasOwnProperty.call(status, parentRequestEventId)) {
    return { ...initialRepliesStatus, ...status[parentRequestEventId] };
  } else {
    return initialRepliesStatus;
  }
};

export const timelineRepliesReducer = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOADING:
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            loading: true,
            error: null,
          },
        },
      };
    case IS_SUBMITTING:
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            submitting: true,
          },
        },
      };
    case HAS_OLDER_DATA:
      return {
        ...state,
        childComments: {
          ...state.childComments,
          [action.payload.parentRequestEventId]: [
            // Prepend the new comments so they're shown at the top of the list.
            ...action.payload.newChildComments,
            ...selectCommentChildren(state, action.payload.parentRequestEventId),
          ],
        },
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            loading: false,
            submitting: false,
            error: null,
            hasMore: action.payload.hasMore,
            page: action.payload.nextPage,
          },
        },
      };
    case HAS_NEWER_DATA:
      return {
        ...state,
        childComments: {
          ...state.childComments,
          [action.payload.parentRequestEventId]: [
            ...selectCommentChildren(state, action.payload.parentRequestEventId),
            // Append the new comments since they are newer
            ...action.payload.newChildComments,
          ],
        },
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            hasMore: action.payload.hasMore,
            loading: false,
            submitting: false,
            error: null,
          },
        },
      };

    case HAS_ERROR:
      return {
        ...state,
        status: {
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            error: action.payload.error,
            loading: false,
            submitting: false,
          },
        },
      };
    case SET_PAGE:
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            page: action.payload.page,
          },
        },
      };
    case REPLY_SET_DRAFT_CONTENT:
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            draftContent: action.payload.content,
          },
        },
      };

    case REPLY_RESTORE_DRAFT_CONTENT:
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.parentRequestEventId]: {
            ...selectCommentRepliesStatus(state, action.payload.parentRequestEventId),
            draftContent: action.payload.content,
            storedDraftContent: action.payload.content,
          },
        },
      };
    case REPLY_UPDATE_COMMENT:
      return {
        ...state,
      };
    case REPLY_DELETE_COMMENT:
      return {
        ...state,
      };
    default:
      return state;
  }
};

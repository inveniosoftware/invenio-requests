// This file is part of InvenioRequests
// Copyright (C) 2025 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { errorSerializer, payloadSerializer } from "../../api/serializers";
import { deleteDraftComment } from "../../timelineCommentEditor/state/actions";
import { selectCommentChildren, selectCommentRepliesStatus } from "./reducer";

export const IS_LOADING = "timelineReplies/IS_LOADING";
export const IS_SUBMITTING = "timelineReplies/IS_SUBMITTING";
export const HAS_OLDER_DATA = "timelineReplies/HAS_OLDER_DATA";
export const HAS_NEWER_DATA = "timelineReplies/HAS_NEWER_DATA";
export const HAS_ERROR = "timelineReplies/HAS_ERROR";
export const SET_PAGE = "timelineReplies/SET_PAGE";
export const REPLY_SET_DRAFT_CONTENT = "timelineReplies/SET_DRAFT_CONTENT";
export const REPLY_RESTORE_DRAFT_CONTENT = "timelineReplies/RESTORE_DRAFT_CONTENT";
export const REPLY_UPDATE_COMMENT = "timelineReplies/REPLY_UPDATE_COMMENT";
export const REPLY_DELETE_COMMENT = "timelineReplies/REPLY_DELETE_COMMENT";

export const setInitialReplies = (parentRequestEvent) => {
  return (dispatch) => {
    dispatch({
      type: HAS_NEWER_DATA,
      payload: {
        parentRequestEventId: parentRequestEvent.id,
        newChildComments: parentRequestEvent.children,
        hasMore: true, // TODO: calculate this from the parentRequestEvent object
      },
    });
  };
};

export const loadOlderReplies = (parentRequestEvent) => {
  return async (dispatch, getState, config) => {
    const { timelineReplies } = getState();
    const { page } = selectCommentRepliesStatus(timelineReplies, parentRequestEvent.id);
    const childComments = selectCommentChildren(timelineReplies, parentRequestEvent.id);

    dispatch({
      type: IS_LOADING,
      payload: { parentRequestEventId: parentRequestEvent.id },
    });

    const pageSize = 10;
    const api = config.requestEventsApi(parentRequestEvent.links);
    const response = await api.getReplies({
      size: pageSize,
      page,
      sort: "newest",
    });

    const hits = response.data.hits.hits;
    const totalLocalCommentCount = childComments.length + hits.length;
    const hasMore = totalLocalCommentCount < response.data.hits.total;

    let nextPage = response.data.page;
    if (hasMore) {
      nextPage = response.data.page + 1;
    }

    dispatch({
      type: HAS_OLDER_DATA,
      payload: {
        parentRequestEventId: parentRequestEvent.id,
        hasMore,
        newChildComments: hits,
        nextPage: nextPage,
      },
    });
  };
};

export const submitReply = (parentRequestEvent, content, format) => {
  return async (dispatch, getState, config) => {
    const { request } = getState();

    dispatch({
      type: IS_SUBMITTING,
      payload: {
        parentRequestEventId: parentRequestEvent.id,
      },
    });

    const payload = payloadSerializer(content, format || "html");

    try {
      const response = await config
        .requestEventsApi(parentRequestEvent.links)
        .submitReply(payload);

      try {
        deleteDraftComment(request.data.id, parentRequestEvent.id);
      } catch (e) {
        console.warn("Failed to delete saved comment:", e);
      }

      await dispatch({
        type: HAS_NEWER_DATA,
        payload: {
          parentRequestEventId: parentRequestEvent.id,
          newChildComments: [response.data],
        },
      });
    } catch (error) {
      dispatch({
        type: HAS_ERROR,
        payload: {
          parentRequestEventId: parentRequestEvent.id,
          error: errorSerializer(error),
        },
      });

      throw error;
    }
  };
};

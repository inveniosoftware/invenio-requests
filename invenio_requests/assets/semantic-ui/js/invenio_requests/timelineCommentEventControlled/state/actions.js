// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  clearTimelineInterval,
  IS_REFRESHING,
  setTimelineInterval,
  SUCCESS,
} from "../../timeline/state/actions";
import { payloadSerializer } from "../../api/serializers";
import _cloneDeep from "lodash/cloneDeep";
import { i18next } from "@translations/invenio_requests/i18next";

export const updateComment = ({ content, format, event }) => {
  return async (dispatch, getState, config) => {
    dispatch(clearTimelineInterval());
    const commentsApi = config.requestEventsApi(event.links);

    const payload = payloadSerializer(content, format);

    dispatch({ type: IS_REFRESHING });

    const response = await commentsApi.updateComment(payload);
    const timelineState = getState().timeline;

    const updatedTimeline = _newStateWithUpdate(response.data, timelineState);
    dispatch({
      type: SUCCESS,
      payload: {
        firstPage: updatedTimeline.firstPage,
        afterFirstPageHits: updatedTimeline.afterFirstPageHits,
        focusedPage: updatedTimeline.focusedPage,
        afterFocusedPageHits: updatedTimeline.afterFocusedPageHits,
        lastPage: updatedTimeline.lastPage,
        data: updatedTimeline.data,
        pageFocused: updatedTimeline.pageFocused,
      },
    });

    dispatch(setTimelineInterval());

    return response.data;
  };
};

export const deleteComment = ({ event }) => {
  return async (dispatch, getState, config) => {
    dispatch(clearTimelineInterval());
    const commentsApi = config.requestEventsApi(event.links);

    dispatch({ type: IS_REFRESHING });

    const response = await commentsApi.deleteComment();

    const deletedTimeline = _newStateWithDelete(event.id, getState);

    dispatch({
      type: SUCCESS,
      payload: {
        firstPage: deletedTimeline.firstPage,
        afterFirstPageHits: deletedTimeline.afterFirstPageHits,
        focusedPage: deletedTimeline.focusedPage,
        afterFocusedPageHits: deletedTimeline.afterFocusedPageHits,
        lastPage: deletedTimeline.lastPage,
        data: deletedTimeline.data,
        pageFocused: deletedTimeline.pageFocused,
      },
    });

    dispatch(setTimelineInterval());

    return response.data;
  };
};

const _newStateWithUpdate = (updatedComment, timelineState) => {
  const timelineClone = _cloneDeep(timelineState);

  const updateHits = (hitsArray) => {
    if (!hitsArray) return;
    const idx = hitsArray.findIndex((c) => c.id === updatedComment.id);
    if (idx !== -1) hitsArray[idx] = updatedComment;
  };

  // Update in firstPage, afterFirstPageHits, focusedPage, afterFocusedPageHits, lastPage
  updateHits(timelineClone.firstPage?.hits?.hits);
  updateHits(timelineClone.afterFirstPageHits);
  updateHits(timelineClone.focusedPage?.hits?.hits);
  updateHits(timelineClone.afterFocusedPageHits);
  updateHits(timelineClone.lastPage?.hits?.hits);

  return timelineClone;
};

const _newStateWithDelete = (eventId, getState) => {
  const timelineState = _cloneDeep(getState().timeline);
  const deletionPayload = {
    content: i18next.t("deleted a comment"),
    event: "comment_deleted",
    format: "html",
  };

  const replaceInHits = (hitsArray) => {
    if (!hitsArray) return;
    const idx = hitsArray.findIndex((c) => c.id === eventId);
    if (idx !== -1) {
      hitsArray[idx] = {
        ...hitsArray[idx],
        type: "L",
        payload: deletionPayload,
      };
    }
  };

  // Delete in firstPage, afterFirstPageHits, focusedPage, afterFocusedPageHits, lastPage
  replaceInHits(timelineState.firstPage?.hits?.hits);
  replaceInHits(timelineState.afterFirstPageHits);
  replaceInHits(timelineState.focusedPage?.hits?.hits);
  replaceInHits(timelineState.afterFocusedPageHits);
  replaceInHits(timelineState.lastPage?.hits?.hits);

  return timelineState;
};

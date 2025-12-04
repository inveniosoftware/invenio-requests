// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  clearTimelineInterval,
  IS_REFRESHING,
  setTimelineInterval,
  SUCCESS,
} from "../../timeline/state/actions";
import { payloadSerializer } from "../../api/serializers";
import _cloneDeep from "lodash/cloneDeep";
import { i18next } from "../../../../translations/invenio_requests/i18next";

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
        appendedPage: updatedTimeline.appendedPage,
        lastPage: updatedTimeline.lastPage,
        data: updatedTimeline.data,
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
        appendedPage: deletedTimeline.appendedPage,
        lastPage: deletedTimeline.lastPage,
        data: deletedTimeline.data,
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

  updateHits(timelineClone.firstPage?.hits?.hits);
  updateHits(timelineClone.appendedPage);
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

  // Delete in firstPage, appendedPage, lastPage
  replaceInHits(timelineState.firstPage?.hits?.hits);
  if (timelineState.appendedPage?.length) {
    replaceInHits(timelineState.appendedPage);
  }
  replaceInHits(timelineState.lastPage?.hits?.hits);

  return timelineState;
};

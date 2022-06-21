// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  CHANGE_PAGE,
  clearTimelineInterval,
  fetchTimeline,
  IS_REFRESHING,
  setTimelineInterval,
  SUCCESS,
} from "../../timeline/state/actions";
import { payloadSerializer } from "../../api/serializers";
import _cloneDeep from "lodash/cloneDeep";

export const updateComment = ({ content, format, event }) => {
  return async (dispatch, getState, config) => {
    dispatch(clearTimelineInterval());
    const commentsApi = config.requestEventsApi(event.links);

    const payload = payloadSerializer(content, format);

    dispatch({ type: IS_REFRESHING });

    const response = await commentsApi.updateComment(payload);

    dispatch({
      type: SUCCESS,
      payload: _newStateWithUpdate(response.data, getState().timeline.data),
    });

    dispatch(setTimelineInterval());

    return response.data;
  };
};

export const deleteComment = ({ event }) => {
  return async (dispatch, getState, config) => {
    dispatch(clearTimelineInterval());
    const timelineState = getState().timeline;
    const commentsApi = config.requestEventsApi(event.links);

    dispatch({ type: IS_REFRESHING });

    const response = await commentsApi.deleteComment();
    const deletionLogEvent = response.data;

    const currentPage = timelineState.page;
    const currentSize = timelineState.size;
    const totalLength = timelineState.data.hits.total;
    const totalPages = Math.ceil(totalLength / currentSize);
    const onLastPage = currentPage === totalPages;

    const shouldSkipEventPush = !onLastPage;

    dispatch({
      type: SUCCESS,
      payload: _newStateWithDelete(
        event.id,
        deletionLogEvent,
        getState,
        shouldSkipEventPush
      ),
    });

    dispatch(setTimelineInterval());

    return response.data;
  };
};

const _newStateWithUpdate = (updatedComment, currentState) => {
  const timelineState = _cloneDeep(currentState);

  const currentHits = timelineState.hits.hits;

  const currentCommentKey = currentHits.findIndex(
    (comment) => comment.id === updatedComment.id
  );

  currentHits[currentCommentKey] = updatedComment;

  return timelineState;
};

const _newStateWithDelete = (
  eventId,
  deletionLogEvent,
  currentState,
  shouldSkipEventPush
) => {
  const timelineState = _cloneDeep(currentState().timeline.data);

  timelineState.hits.hits = timelineState.hits.hits.filter(
    (event) => event.id !== eventId
  );

  if (shouldSkipEventPush) {
    return timelineState;
  }

  timelineState.hits.hits.push(deletionLogEvent);

  return timelineState;
};

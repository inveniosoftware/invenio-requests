// This file is part of InvenioRequests
// Copyright (C) 2026 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { connect } from "react-redux";
import { selectCommentReplies, selectCommentRepliesStatus } from "./state/reducer.js";
import {
  appendEventContent,
  fetchRepliesPage,
  REPLY_DELETED_COMMENT,
  REPLY_RESTORE_DRAFT_CONTENT,
  REPLY_SET_DRAFT_CONTENT,
  REPLY_UPDATED_COMMENT,
  SET_SUBMITTING,
  setInitialReplies,
  submitReply,
} from "./state/actions.js";
import { defaultReplyQueryParams } from "../data.js";
import {
  restoreDraftContent,
  setDraftContent,
} from "../timelineCommentEditor/state/actions.js";
import {
  deleteComment,
  updateComment,
} from "../timelineCommentEventControlled/state/actions.js";
import TimelineFeedRepliesComponent from "./TimelineFeedReplies.js";

const mapDispatchToProps = (dispatch, { parentRequestEvent }) => ({
  fetchPage: (page) => dispatch(fetchRepliesPage(parentRequestEvent, page)),
  setCommentContent: (content) =>
    dispatch(setDraftContent(content, parentRequestEvent.id, REPLY_SET_DRAFT_CONTENT)),
  restoreCommentContent: () =>
    dispatch(restoreDraftContent(parentRequestEvent.id, REPLY_RESTORE_DRAFT_CONTENT)),
  submitComment: (content) =>
    dispatch(submitReply(parentRequestEvent, content, "html")),
  updateComment: (payload) =>
    dispatch(
      updateComment({
        ...payload,
        successEvent: REPLY_UPDATED_COMMENT,
        loadingEvent: SET_SUBMITTING,
      })
    ),
  deleteComment: async (payload) =>
    dispatch(
      deleteComment({
        ...payload,
        successEvent: REPLY_DELETED_COMMENT,
        loadingEvent: SET_SUBMITTING,
      })
    ),
  appendCommentContent: (content, eventId) =>
    dispatch(appendEventContent(eventId, content)),
  setInitialReplies: (focusEvent) =>
    dispatch(setInitialReplies(parentRequestEvent, focusEvent)),
});

const mapStateToProps = (state, { parentRequestEvent }) => {
  const {
    pageNumbers,
    error,
    submitting: isSubmitting,
    loading: loadingMore,
    draftContent: commentContent,
    storedDraftContent: storedCommentContent,
    appendedDraftContent: appendedCommentContent,
    submissionError,
    totalHits,
  } = selectCommentRepliesStatus(state.timelineReplies, parentRequestEvent.id);

  const { size } = defaultReplyQueryParams;

  return {
    hits: selectCommentReplies(state.timelineReplies, parentRequestEvent.id),
    totalHits,
    pageNumbers,
    error,
    isSubmitting,
    size,
    permissions: parentRequestEvent.permissions,
    initialLoading: false,
    loadingMore,
    commentContent,
    storedCommentContent,
    appendedCommentContent,
    submissionError,
  };
};

const TimelineFeedReplies = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineFeedRepliesComponent);

export default TimelineFeedReplies;

// This file is part of InvenioRequests
// Copyright (C) 2025 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import Overridable from "react-overridable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Divider, Icon } from "semantic-ui-react";
import FakeInput from "../components/FakeInput";
import { i18next } from "@translations/invenio_requests/i18next";
import TimelineCommentEditor from "../timelineCommentEditor/TimelineCommentEditor";
import TimelineCommentEventControlled from "../timelineCommentEventControlled/TimelineCommentEventControlled.js";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";

class TimelineCommentReplies extends Component {
  constructor() {
    super();
    this.state = {
      isExpanded: true,
      isReplying: false,
      deleteModalAction: undefined,
    };
  }

  componentDidMount() {
    const { setInitialReplies, parentRequestEvent } = this.props;
    setInitialReplies(parentRequestEvent);
  }

  onRepliesClick = () => {
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded });
  };

  onFakeInputActivate = (value) => {
    this.setState({ isReplying: true, isExpanded: true });
  };

  restoreCommentContent = () => {
    const { restoreCommentContent, parentRequestEvent } = this.props;
    restoreCommentContent(parentRequestEvent.id);
  };

  setCommentContent = (content) => {
    const { setCommentContent, parentRequestEvent } = this.props;
    setCommentContent(content, parentRequestEvent.id);
  };

  submitReply = (content, format) => {
    const { submitReply, parentRequestEvent } = this.props;
    submitReply(parentRequestEvent, content, format);
  };

  onLoadMoreClick = () => {
    const { loadOlderReplies, parentRequestEvent } = this.props;
    loadOlderReplies(parentRequestEvent);
  };

  onDeleteModalOpen = (action) => {
    this.setState({ deleteModalAction: action });
  };

  render() {
    const {
      childComments,
      parentRequestEvent,
      userAvatar,
      draftContent,
      storedDraftContent,
      submitting,
      error,
      hasMore,
      updateComment,
      deleteComment,
    } = this.props;
    const { isExpanded, isReplying, deleteModalAction } = this.state;
    return (
      <>
        <Button size="tiny" onClick={this.onRepliesClick} className="text-only">
          {i18next.t("Replies")}
          <span className="requests-reply-count ml-5">
            {parentRequestEvent.children_count ?? "7"}
          </span>
          <Icon
            name={`caret ${isExpanded ? "down" : "right"}`}
            className="requests-reply-caret"
          />
        </Button>

        {isExpanded && (
          <div>
            {hasMore && (
              <Button
                size="tiny"
                onClick={this.onLoadMoreClick}
                className="text-only requests-reply-load-more"
              >
                {i18next.t("Load more")}
              </Button>
            )}
            {childComments.map((c) => (
              <TimelineCommentEventControlled
                key={c.id}
                event={c}
                isReply
                openConfirmModal={this.onDeleteModalOpen}
                updateComment={updateComment}
                deleteComment={deleteComment}
              />
            ))}
            <Divider />
          </div>
        )}

        <DeleteConfirmationModal
          open={!!deleteModalAction}
          action={deleteModalAction}
          onOpen={() => {}}
          onClose={() => this.setState({ deleteModalAction: undefined })}
        />

        {!isReplying ? (
          <FakeInput
            placeholder={i18next.t("Write a reply")}
            userAvatar={userAvatar}
            onActivate={this.onFakeInputActivate}
            className={isExpanded ? undefined : "mt-10"}
          />
        ) : (
          <TimelineCommentEditor
            // We must declare these as static (non-inline) functions to avoid re-rendering
            restoreCommentContent={this.restoreCommentContent}
            setCommentContent={this.setCommentContent}
            submitComment={this.submitReply}
            commentContent={draftContent}
            storedCommentContent={storedDraftContent}
            userAvatar={userAvatar}
            isLoading={submitting}
            error={error}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        )}
      </>
    );
  }
}

TimelineCommentReplies.propTypes = {
  childComments: PropTypes.array.isRequired,
  parentRequestEvent: PropTypes.object.isRequired,
  loadOlderReplies: PropTypes.func.isRequired,
  userAvatar: PropTypes.string,
  setCommentContent: PropTypes.func.isRequired,
  restoreCommentContent: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string,
  draftContent: PropTypes.string.isRequired,
  storedDraftContent: PropTypes.string.isRequired,
  submitReply: PropTypes.func.isRequired,
  setInitialReplies: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

TimelineCommentReplies.defaultProps = {
  userAvatar: "",
  error: null,
};

export default Overridable.component(
  "InvenioRequests.Timeline.CommentReplies",
  TimelineCommentReplies
);

// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
// Copyright (C) 2025 Graz University of Technology.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import Overridable from "react-overridable";
import { Container, Message, Icon } from "semantic-ui-react";
import Error from "../components/Error";
import Loader from "../components/Loader";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import RequestsFeed from "../components/RequestsFeed";
import TimelineCommentEditor from "../timelineCommentEditor/TimelineCommentEditor.js";
import LoadMore from "./LoadMore";
import { i18next } from "@translations/invenio_requests/i18next";
import TimelineCommentEventControlled from "../timelineCommentEventControlled/TimelineCommentEventControlled.js";
import _cloneDeep from "lodash/cloneDeep";

class TimelineFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      modalAction: null,
    };
  }

  loadPage = (page) => {
    const { fetchPage } = this.props;
    fetchPage(page);
  };

  onOpenModal = (action) => {
    this.setState({ modalOpen: true, modalAction: action });
  };

  renderHitList = (hits) => {
    const {
      userAvatar,
      permissions,
      request,
      updateComment,
      deleteComment,
      appendCommentContent,
    } = this.props;

    return (
      <>
        {hits.map((event) => (
          <TimelineCommentEventControlled
            key={event.id}
            event={event}
            openConfirmModal={this.onOpenModal}
            userAvatar={userAvatar}
            allowQuote={false}
            allowReply={permissions.can_reply_comment}
            request={request}
            permissions={permissions}
            updateComment={updateComment}
            deleteComment={deleteComment}
            appendCommentContent={appendCommentContent}
          />
        ))}
      </>
    );
  };

  getFeedElements = () => {
    const {
      hits: _hits,
      pageNumbers,
      size,
      parentRequestEvent,
      totalHits,
    } = this.props;
    const hits = _cloneDeep(_hits);

    const elements = [];
    pageNumbers.forEach((pageNumber, i) => {
      if (i === 0) {
        if (pageNumber > 1) {
          elements.push({
            type: "LoadMore",
            page: pageNumber - 1,
            count: (pageNumber - 1) * size,
            key: "LoadMore-" + pageNumber,
          });
        }

        elements.push({
          type: "RequestFeed",
          children: hits[pageNumber],
          key: "RequestFeed-" + pageNumber,
        });
        return;
      }

      const previousPageNumber = pageNumbers[i - 1];
      const difference = pageNumber - previousPageNumber;
      if (difference > 1) {
        elements.push({
          type: "LoadMore",
          page: pageNumber - 1,
          count: (difference - 1) * size,

          key: "LoadMore-" + pageNumber,
        });
        elements.push({
          type: "RequestFeed",
          children: hits[pageNumber],
          key: "RequestFeed-" + pageNumber,
        });
        return;
      }

      elements[elements.length - 1].children.push(...hits[pageNumber]);
    });

    const lastPage = Math.ceil(totalHits / size);
    const lastLoadedPage = pageNumbers[pageNumbers.length - 1];
    const difference = lastPage - lastLoadedPage;
    if (difference > 0) {
      elements.push({
        type: "LoadMore",
        page: lastLoadedPage + 1,
        count: totalHits - pageNumbers.length * size,
        key: "LoadMore-" + (lastLoadedPage + 1),
      });
    }

    if (parentRequestEvent) {
      return elements.toReversed();
    } else {
      return elements;
    }
  };

  render() {
    const {
      initialLoading,
      error,
      userAvatar,
      request,
      permissions,
      warning,
      loadingMore,
      parentRequestEvent,
      isSubmitting,
      commentContent,
      storedCommentContent,
      appendedCommentContent,
      setCommentContent,
      restoreCommentContent,
      submissionError,
      submitComment,
    } = this.props;
    const { modalOpen, modalAction } = this.state;

    // const firstFeedClassName = remainingBeforeFocused > 0 ? "gradient-feed" : null;
    // const lastFeedClassName =
    // remainingAfterFocused > 0 || (remainingBeforeFocused > 0 && focusedPage === null)
    // ? "stretched-feed gradient-feed"
    // : null;
    // const focusedFeedClassName =
    // (focusedPage !== null && remainingBeforeFocused > 0 ? "stretched-feed" : "") +
    // (remainingAfterFocused > 0 ? " gradient-feed" : "");

    const isReplyTimeline = parentRequestEvent !== null;

    return (
      <Loader isLoading={initialLoading}>
        <Error error={error}>
          {warning && (
            <Message visible warning>
              <p>
                <Icon name="warning sign" />
                {warning}
              </p>
            </Message>
          )}

          <Overridable id="TimelineFeed.layout" {...this.props}>
            <Container id="requests-timeline" className="ml-0-mobile mr-0-mobile">
              <Overridable
                id="TimelineFeed.header"
                request={request}
                permissions={permissions}
              />

              {this.getFeedElements().map((el) =>
                el.type === "LoadMore" ? (
                  <LoadMore
                    key={el.key}
                    remaining={el.count}
                    loading={loadingMore}
                    loadNextAppendedPage={() => this.loadPage(el.page)}
                  />
                ) : (
                  <RequestsFeed key={el.key}>
                    {this.renderHitList(el.children)}
                  </RequestsFeed>
                )
              )}

              <TimelineCommentEditor
                isLoading={isSubmitting}
                commentContent={commentContent}
                storedCommentContent={storedCommentContent}
                appendedCommentContent={appendedCommentContent}
                setCommentContent={setCommentContent}
                restoreCommentContent={restoreCommentContent}
                error={submissionError}
                submitComment={submitComment}
                userAvatar={userAvatar}
                canCreateComment={
                  isReplyTimeline
                    ? permissions.can_reply_comment
                    : permissions.can_create_comment
                }
                // This is a custom autoFocus prop, not the browser one
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={isReplyTimeline}
                saveButtonLabel={
                  isReplyTimeline ? i18next.t("Reply") : i18next.t("Comment")
                }
                saveButtonIcon={isReplyTimeline ? "reply" : "send"}
                onCancel={this.onCancelClick}
              />
              <DeleteConfirmationModal
                open={modalOpen}
                action={modalAction}
                onOpen={() => this.setState({ modalOpen: true })}
                onClose={() => this.setState({ modalOpen: false })}
              />
            </Container>
          </Overridable>
        </Error>
      </Loader>
    );
  }
}

TimelineFeed.propTypes = {
  hits: PropTypes.object.isRequired,
  pageNumbers: PropTypes.array.isRequired,
  totalHits: PropTypes.number.isRequired,
  fetchPage: PropTypes.func.isRequired,
  error: PropTypes.string,
  isSubmitting: PropTypes.bool,
  size: PropTypes.number.isRequired,
  userAvatar: PropTypes.string,
  request: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  initialLoading: PropTypes.bool.isRequired,
  warning: PropTypes.string,
  parentRequestEvent: PropTypes.object,
  loadingMore: PropTypes.bool.isRequired,
  commentContent: PropTypes.string.isRequired,
  storedCommentContent: PropTypes.string,
  appendedCommentContent: PropTypes.string.isRequired,
  setCommentContent: PropTypes.func.isRequired,
  restoreCommentContent: PropTypes.func.isRequired,
  submissionError: PropTypes.string,
  submitComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  appendCommentContent: PropTypes.func.isRequired,
};

TimelineFeed.defaultProps = {
  timeline: null,
  error: null,
  isSubmitting: false,
  userAvatar: "",
  warning: null,
  parentRequestEvent: null,
  storedCommentContent: null,
  submissionError: null,
};

export default Overridable.component("TimelineFeed", TimelineFeed);

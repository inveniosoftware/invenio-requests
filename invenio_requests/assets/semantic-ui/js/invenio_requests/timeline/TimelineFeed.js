// This file is part of InvenioRequests
// Copyright (C) 2022-2026 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
// Copyright (C) 2025 Graz University of Technology.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import Overridable from "react-overridable";
import { Container, Message, Icon, Button, Divider } from "semantic-ui-react";
import Error from "../components/Error";
import Loader from "../components/Loader";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import RequestsFeed from "../components/RequestsFeed";
import TimelineCommentEditor from "../timelineCommentEditor/TimelineCommentEditor.js";
import LoadMore from "./LoadMore";
import { i18next } from "@translations/invenio_requests/i18next";
import TimelineCommentEventControlled from "../timelineCommentEventControlled/TimelineCommentEventControlled.js";
import _cloneDeep from "lodash/cloneDeep";
import FakeInput from "../components/FakeInput.js";

const TimelineContainerElement = ({ children, isReplyTimeline }) => {
  if (isReplyTimeline) {
    return <div className="requests-reply-container">{children}</div>;
  } else {
    return (
      <Container id="requests-timeline" className="ml-0-mobile mr-0-mobile">
        {children}
      </Container>
    );
  }
};

TimelineContainerElement.propTypes = {
  children: PropTypes.node.isRequired,
  isReplyTimeline: PropTypes.bool.isRequired,
};

class TimelineFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      modalAction: null,
      expanded: true,
    };
  }

  loadPage = (page) => {
    const { fetchPage } = this.props;
    return fetchPage(page);
  };

  onOpenModal = (action) => {
    this.setState({ modalOpen: true, modalAction: action });
  };

  onRepliesClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
  };

  onCancelClick = () => {
    const { setIsReplying, clearDraft } = this.props;
    setIsReplying(false);
    clearDraft();
  };

  onFakeInputActivate = () => {
    const { setIsReplying } = this.props;
    setIsReplying(true);
  };

  appendCommentContent = (eventId, content) => {
    const { appendCommentContent, parentRequestEvent } = this.props;
    if (parentRequestEvent) {
      appendCommentContent(parentRequestEvent.id, content);
    } else {
      appendCommentContent(eventId, content);
    }
  };

  renderFeed = (hits, isBeforeLoadMore, isAfterLoadMore) => {
    const {
      userAvatar,
      permissions,
      request,
      updateComment,
      deleteComment,
      parentRequestEvent,
    } = this.props;

    return (
      <RequestsFeed
        className={`${isBeforeLoadMore ? "before-load-more" : ""}${
          isAfterLoadMore ? " after-load-more" : ""
        }`}
      >
        {hits.map((event, index) => (
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
            appendCommentContent={(content) =>
              this.appendCommentContent(event.id, content)
            }
            isReply={!!parentRequestEvent}
            isBeforeLoadMore={isBeforeLoadMore && index === hits.length - 1}
          />
        ))}
      </RequestsFeed>
    );
  };

  /**
   * Converts the Redux `hits` object into a series of "instructions" for rendering contiguous feed blocks
   * and load-more buttons. The instructions are then rendered into React elements. We don't directly generate
   * React elements here to allow easily appending contiguous children to the same RequestFeed and also to
   * somewhat preserve the declarativeness of React.
   *
   * @param reversePages boolean - Returns the pages in reversed order
   */
  getFeedElements = (reversePages = false) => {
    const {
      hits: _hits,
      pageNumbers: _pageNumbers,
      size,
      totalHits: _totalHits,
    } = this.props;

    // Clone the hits object to avoid accidentally modifying the Redux store
    const hits = _cloneDeep(_hits);

    let pageNumbers = _pageNumbers;
    if (reversePages) {
      pageNumbers = pageNumbers.toReversed();
    }

    // Exclude hits on the virtual "page zero", which are new comments added by the user since page load.
    // We do not need to count these for the purpose of the load more buttons.
    const pageZeroHits = pageNumbers.includes(0) ? hits[0].length : 0;
    const totalHits = _totalHits - pageZeroHits;

    const elements = [];
    pageNumbers.forEach((pageNumber, i) => {
      // If we are on the top-most page
      if (i === 0) {
        if (!reversePages) {
          // If rendering in normal order, this means we have some non-loaded pages at the top of the page.
          if (pageNumber > 1) {
            elements.push({
              type: "LoadMore",
              page: pageNumber - 1,
              count: (pageNumber - 1) * size,
              key: "LoadMore-" + pageNumber,
              isLoadingAbove: false,
            });
          }

          elements.push({
            type: "RequestFeed",
            children: hits[pageNumber],
            key: "RequestFeed-" + pageNumber,
          });
        } else {
          // We are not starting from page 1, so we need to figure out how many pages have not yet been loaded
          // at the top of the page. If it's not zero, we need a button.
          const lastPage = Math.ceil(totalHits / size);
          const lastLoadedPage = pageNumbers[0];
          const difference = lastPage - lastLoadedPage;
          if (difference > 0) {
            elements.push({
              type: "LoadMore",
              page: lastLoadedPage + 1,
              count: totalHits - lastLoadedPage * size,
              key: "LoadMore-" + (lastLoadedPage + 1),
              isLoadingAbove: false,
            });
          }
          elements.push({
            type: "RequestFeed",
            children: hits[pageNumber],
            key: "RequestFeed-" + pageNumber,
          });
        }

        return;
      }

      // Check if there is a gap in the page numbers, and add a button if there is.
      const previousPageNumber = pageNumbers[i - 1];
      const difference = reversePages
        ? previousPageNumber - pageNumber
        : pageNumber - previousPageNumber;
      if (difference > 1) {
        const pageToLoad = reversePages ? pageNumber + 1 : pageNumber - 1;
        elements.push({
          type: "LoadMore",
          page: pageToLoad,
          count: (difference - 1) * size,

          key: "LoadMore-" + pageNumber,
          isLoadingAbove: false,
        });
        elements.push({
          type: "RequestFeed",
          children: hits[pageNumber],
          key: "RequestFeed-" + pageNumber,
        });
        return;
      }

      // Append the children of this page to the previous RequestFeed.
      // To preserve the correct margins, padding, etc, we want to add the items to an
      // existing RequestFeed instead of creating a new one.
      elements[elements.length - 1].children.push(...hits[pageNumber]);
    });

    return elements;
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
      totalHits,
      replying,
    } = this.props;
    const { modalOpen, modalAction, expanded } = this.state;

    const isReplyTimeline = parentRequestEvent !== null;
    const hasHits = totalHits !== 0;
    const feedElements = this.getFeedElements(isReplyTimeline);

    return (
      <Loader isLoading={initialLoading}>
        <Error error={error}>
          <Overridable id="TimelineFeed.layout" {...this.props}>
            <TimelineContainerElement isReplyTimeline={isReplyTimeline}>
              {warning && (
                <Message visible warning>
                  <p>
                    <Icon name="warning sign" />
                    {warning}
                  </p>
                </Message>
              )}

              {!isReplyTimeline ? (
                <Overridable
                  id="TimelineFeed.header"
                  request={request}
                  permissions={permissions}
                />
              ) : null}

              {isReplyTimeline && hasHits ? (
                <Button
                  size="tiny"
                  onClick={this.onRepliesClick}
                  className="text-only requests-reply-expand"
                >
                  <Icon
                    name={`caret ${expanded ? "down" : "right"}`}
                    className="requests-reply-caret"
                  />
                  {i18next.t("Replies")}
                  <span className="requests-reply-count ml-5">{totalHits}</span>
                </Button>
              ) : null}

              {expanded && hasHits ? (
                // For CSS, we need this to be inside a div
                <div>
                  {feedElements.map((el, index) =>
                    el.type === "LoadMore" ? (
                      <LoadMore
                        key={el.key}
                        count={el.count}
                        loading={loadingMore}
                        onClick={() => this.loadPage(el.page)}
                        isTiny={isReplyTimeline}
                        isLoadingAbove={el.isLoadingAbove}
                      />
                    ) : (
                      <React.Fragment key={el.key}>
                        {this.renderFeed(
                          el.children,
                          index < feedElements.length - 1 &&
                            feedElements[index + 1].type === "LoadMore",
                          index > 0 && feedElements[index - 1].type === "LoadMore"
                        )}
                      </React.Fragment>
                    )
                  )}
                  {isReplyTimeline ? <Divider /> : null}
                </div>
              ) : null}

              {!replying && isReplyTimeline ? (
                <FakeInput
                  placeholder={i18next.t("Write a reply")}
                  userAvatar={userAvatar}
                  onActivate={this.onFakeInputActivate}
                  className={!hasHits || !expanded ? "mt-10" : undefined}
                  disabled={!permissions.can_reply_comment}
                />
              ) : (
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
                  onCancel={isReplyTimeline ? this.onCancelClick : undefined}
                />
              )}
              <DeleteConfirmationModal
                open={modalOpen}
                action={modalAction}
                onOpen={() => this.setState({ modalOpen: true })}
                onClose={() => this.setState({ modalOpen: false })}
              />
            </TimelineContainerElement>
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
  appendedCommentContent: PropTypes.string,
  setCommentContent: PropTypes.func.isRequired,
  restoreCommentContent: PropTypes.func.isRequired,
  submissionError: PropTypes.string,
  submitComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  appendCommentContent: PropTypes.func.isRequired,
  replying: PropTypes.bool,
  setIsReplying: PropTypes.func,
  clearDraft: PropTypes.func,
};

TimelineFeed.defaultProps = {
  error: null,
  isSubmitting: false,
  userAvatar: "",
  warning: null,
  parentRequestEvent: null,
  storedCommentContent: null,
  submissionError: null,
  replying: false,
  setIsReplying: null,
  appendedCommentContent: null,
  clearDraft: null,
};

export default Overridable.component("TimelineFeed", TimelineFeed);

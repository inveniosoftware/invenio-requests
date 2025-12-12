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
import { TimelineCommentEditor } from "../timelineCommentEditor";
import { TimelineCommentEventControlled } from "../timelineCommentEventControlled";
import { getEventIdFromUrl } from "../timelineEvents/utils";
import LoadMore from "./LoadMore";

class TimelineFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      modalAction: null,
    };
  }

  componentDidMount() {
    const { getTimelineWithRefresh } = this.props;

    // Check if an event ID is included in the hash
    getTimelineWithRefresh(getEventIdFromUrl());
  }

  async componentDidUpdate(prevProps) {
    const { timeline } = this.props;

    const hasNewComments =
      prevProps.timeline?.lastPage?.hits?.total !== timeline?.lastPage?.hits?.total;
    if (hasNewComments) {
      await window.MathJax?.typesetPromise();
    }
  }

  componentWillUnmount() {
    const { timelineStopRefresh } = this.props;
    timelineStopRefresh();
  }

  loadNextAppendedPage = async () => {
    const { timeline, fetchTimelinePage, size, appendPage } = this.props;
    const { page, afterFirstPageHits } = timeline;
    const nextPage = page + 1;

    try {
      const response = await fetchTimelinePage(nextPage, size);
      appendPage({
        afterFirstPageHits: [...afterFirstPageHits, ...response.hits.hits],
        page: nextPage,
      });
    } catch (error) {
      console.error("Error loading next page after first pages:", error);
    }
  };

  loadNextPageAfterFocused = async () => {
    const { timeline, fetchTimelinePage, size, appendPage } = this.props;
    const { pageFocused, afterFocusedPageHits } = timeline;
    const nextPageAfterFocused = pageFocused + 1;

    try {
      const response = await fetchTimelinePage(nextPageAfterFocused, size);
      appendPage({
        afterFocusedPageHits: [...afterFocusedPageHits, ...response.hits.hits],
        pageFocused: nextPageAfterFocused,
      });
    } catch (error) {
      console.error("Error loading next page after focused page:", error);
    }
  };

  onOpenModal = (action) => {
    this.setState({ modalOpen: true, modalAction: action });
  };

  render() {
    const {
      timeline,
      loading,
      error,
      userAvatar,
      request,
      permissions,
      warning,
      size,
    } = this.props;
    const { modalOpen, modalAction } = this.state;
    const {
      firstPage,
      lastPage,
      focusedPage,
      afterFirstPageHits,
      afterFocusedPageHits,
      pageFocused,
    } = timeline;

    const totalComments = lastPage?.hits?.total || 0;
    const firstPageHits = firstPage?.hits?.hits || [];
    const lastPageHits = lastPage?.hits?.hits || [];

    let remainingBefore = 0;
    let remainingAfter = 0;

    if (pageFocused && pageFocused !== lastPage?.page) {
      remainingBefore =
        (focusedPage?.page - 1) * size -
        (firstPageHits.length + afterFirstPageHits.length);
      remainingAfter = totalComments - (pageFocused * size + lastPageHits.length);
    } else {
      remainingBefore =
        totalComments -
        (firstPageHits.length + afterFirstPageHits.length + lastPageHits.length);
    }

    const lastPageClassName =
      (remainingAfter > 0 || (remainingBefore > 0 && pageFocused === null)) &&
      "last-page";
    const focusedPageClassName =
      pageFocused !== null && remainingBefore > 0 && "last-page";

    return (
      <Loader isLoading={loading}>
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

              {/* First page (oldest comments) */}
              <RequestsFeed className="first-page">
                {firstPageHits.map((event) => (
                  <TimelineCommentEventControlled
                    key={event.id}
                    event={event}
                    openConfirmModal={this.onOpenModal}
                  />
                ))}

                {/* Pages before focused page */}
                {afterFirstPageHits &&
                  afterFirstPageHits.map((event) => (
                    <TimelineCommentEventControlled
                      key={event.id}
                      event={event}
                      openConfirmModal={this.onOpenModal}
                    />
                  ))}
              </RequestsFeed>

              {/* LoadMore button for pages before focused */}
              {remainingBefore > 0 && (
                <LoadMore
                  remaining={remainingBefore}
                  loading={loading}
                  loadNextAppendedPage={this.loadNextAppendedPage}
                />
              )}

              {/* Focused page */}
              {focusedPage && (
                <>
                  <RequestsFeed className={focusedPageClassName}>
                    {focusedPage?.hits?.hits?.map((event) => (
                      <TimelineCommentEventControlled
                        key={event.id}
                        event={event}
                        openConfirmModal={this.onOpenModal}
                      />
                    ))}

                    {/* Pages after focused page */}
                    {afterFocusedPageHits.map((event) => (
                      <TimelineCommentEventControlled
                        key={event.id}
                        event={event}
                        openConfirmModal={this.onOpenModal}
                      />
                    ))}
                  </RequestsFeed>

                  {/* LoadMore button for pages after focused */}
                  {remainingAfter > 0 && (
                    <LoadMore
                      remaining={remainingAfter}
                      loading={loading}
                      loadNextAppendedPage={this.loadNextPageAfterFocused}
                    />
                  )}
                </>
              )}

              {/* Last page (newest comments) */}
              {lastPageHits.length > 0 && (
                <RequestsFeed className={lastPageClassName}>
                  {lastPageHits.map((event) => (
                    <TimelineCommentEventControlled
                      key={event.id}
                      event={event}
                      openConfirmModal={this.onOpenModal}
                    />
                  ))}
                </RequestsFeed>
              )}

              <TimelineCommentEditor userAvatar={userAvatar} />
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
  getTimelineWithRefresh: PropTypes.func.isRequired,
  timelineStopRefresh: PropTypes.func.isRequired,
  fetchTimelinePage: PropTypes.func.isRequired,
  appendPage: PropTypes.func.isRequired,
  timeline: PropTypes.object,
  error: PropTypes.object,
  isSubmitting: PropTypes.bool,
  page: PropTypes.number,
  size: PropTypes.number,
  userAvatar: PropTypes.string,
  request: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  warning: PropTypes.string,
};

TimelineFeed.defaultProps = {
  timeline: null,
  error: null,
  isSubmitting: false,
  page: 1,
  size: 10,
  userAvatar: "",
  warning: null,
};

export default Overridable.component("TimelineFeed", TimelineFeed);

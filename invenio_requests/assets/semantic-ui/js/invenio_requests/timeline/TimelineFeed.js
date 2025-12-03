// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
// Copyright (C) 2025 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import Overridable from "react-overridable";
import {
  Container,
  Grid,
  Label,
  Segment,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import Error from "../components/Error";
import Loader from "../components/Loader";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import RequestsFeed from "../components/RequestsFeed";
import { TimelineCommentEditor } from "../timelineCommentEditor";
import { TimelineCommentEventControlled } from "../timelineCommentEventControlled";
import { getEventIdFromUrl } from "../timelineEvents/utils";

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

    const hasComments = timeline?.hits?.total > 0;
    const hasNewComments = prevProps.timeline?.hits?.total !== timeline?.hits?.total;
    if (hasComments && hasNewComments) {
      await window.MathJax?.typesetPromise();
    }
  }

  componentWillUnmount() {
    const { timelineStopRefresh } = this.props;
    timelineStopRefresh();
  }

  loadNextAppendedPage = async () => {
    const { timeline, fetchTimelinePage, size, appendPage } = this.props;
    const nextPage = (timeline.firstPageCurrent || 1) + 1;

    try {
      const response = await fetchTimelinePage(nextPage, size);

      appendPage(response.hits.hits, nextPage);
    } catch (error) {
      console.error("Error loading next page of first feed:", error);
    }
  };

  onOpenModal = (action) => {
    this.setState({ modalOpen: true, modalAction: action });
  };

  render() {
    const { timeline, loading, error, userAvatar, request, permissions, warning } =
      this.props;
    const { modalOpen, modalAction } = this.state;
    const firstPageHits = timeline.firstPage?.hits?.hits || [];
    const appendedPageHits = timeline.appendedPage || [];
    const lastPageHits = timeline.lastPage?.hits?.hits || [];

    const totalLoaded =
      firstPageHits.length + appendedPageHits.length + lastPageHits.length;
    const totalComments = timeline.firstPage?.hits?.total || 0;

    const remaining = totalComments - totalLoaded;

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
              <RequestsFeed>
                {firstPageHits.map((event) => (
                  <TimelineCommentEventControlled
                    key={event.id}
                    event={event}
                    openConfirmModal={this.onOpenModal}
                  />
                ))}

                {/* Extra pages appended */}
                {appendedPageHits.map((event) => (
                  <TimelineCommentEventControlled
                    key={event.id}
                    event={event}
                    openConfirmModal={this.onOpenModal}
                  />
                ))}
              </RequestsFeed>
              {/* Load more comments Segment */}
              {remaining > 0 && (
                <Container textAlign="center" className="rel-mb-1 rel-mt-1">
                  <Grid verticalAlign="middle" columns="three" centered>
                    <Grid.Row centered>
                      <Grid.Column
                        tablet={6}
                        computer={6}
                        className="tablet only computer only rel-pl-3 pr-0"
                      >
                        <div className="hidden-comment-line" />
                      </Grid.Column>
                      <Grid.Column mobile={8} tablet={3} computer={3} className="p-0">
                        <Segment textAlign="center">
                          <Header as="h3" size="tiny" className="text-muted mb-0">
                            {remaining} older comments
                          </Header>
                          <Label
                            as="a"
                            size="large"
                            basic
                            color="blue"
                            className="borderless"
                            onClick={this.loadNextAppendedPage}
                            disabled={loading}
                          >
                            {loading ? "Loading..." : "Load more..."}
                          </Label>
                        </Segment>
                      </Grid.Column>
                      <Grid.Column
                        tablet={6}
                        computer={6}
                        className="tablet only computer only pl-0"
                      >
                        <div className="hidden-comment-line" />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Container>
              )}

              {/* Last page (newest comments) */}
              {timeline.lastPage?.hits && (
                <RequestsFeed isLastPage>
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
  appendPage: PropTypes.func.isRequired, // new
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

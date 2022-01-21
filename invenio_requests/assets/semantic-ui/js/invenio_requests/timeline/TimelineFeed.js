import Error from "../components/Error";
import TimelineEvent from "./TimelineEvent";
import Loader from "../components/Loader";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Feed, Segment } from "semantic-ui-react";

class TimelineFeed extends Component {
  componentDidMount() {
    const { getTimelineWithRefresh } = this.props;
    getTimelineWithRefresh();
  }

  componentWillUnmount() {
    const { timelineStopRefresh } = this.props;
    timelineStopRefresh();
  }

  render() {
    const { timeline, loading, error } = this.props;
    return (
      <Loader isLoading={loading}>
        <Error error={error}>
          <Overridable id="TimelineFeed.layout" {...this.props}>
            <Container>
              <Segment>
                <Feed>
                  {timeline.hits?.hits.map((comment) => (
                    <TimelineEvent event={comment} key={comment.id} />
                  ))}
                </Feed>
              </Segment>
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
  timeline: PropTypes.object,
  error: PropTypes.object,
};

export default Overridable.component("TimelineFeed", TimelineFeed);
import Error from '../components/Error';
import TimelineEvent from "./TimelineEvent";
import Loader from "../components/Loader";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Feed, Segment } from "semantic-ui-react";

class TimelineFeed extends Component {
  componentDidMount() {
    this.getTimelineWithRefresh();
  }

  timelineReload = () => {
    const { fetchTimeline, loading, refreshing, error } = this.props;
    if (error) {
      // stop requesting if error
      clearInterval(this.intervalId);
    }
    // avoid concurrent requests if the previous one did not finish
    return !loading && !refreshing && fetchTimeline(false);
  };

  getTimelineWithRefresh = () => {
    const { fetchTimeline, setRefreshInterval } = this.props;
    fetchTimeline();
    this.intervalId = setInterval(this.timelineReload, setRefreshInterval());
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
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
  fetchTimeline: PropTypes.func.isRequired,
  setRefreshInterval: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  timeline: PropTypes.object,
  error: PropTypes.object,
};

export default Overridable.component("TimelineFeed", TimelineFeed);

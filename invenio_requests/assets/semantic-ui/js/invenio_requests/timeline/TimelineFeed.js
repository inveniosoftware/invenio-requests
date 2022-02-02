import TimelineEvent from './TimelineEvent';
import Loader from "../components/Loader";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Feed, Segment } from "semantic-ui-react";

class TimelineFeed extends Component {

  componentDidMount() {
    const { fetchTimeline } = this.props;
    fetchTimeline();
  }

  render() {
    const { timeline, loading } = this.props;
    return (
      <Loader isLoading={loading}>
        <Overridable id="Timeline.layout" {...this.props}>
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
      </Loader>
    );
  }
}

TimelineFeed.propTypes = {
  fetchTimeline: PropTypes.func.isRequired,
  timeline: PropTypes.object,
};

export default Overridable.component("TimelineFeed", TimelineFeed);

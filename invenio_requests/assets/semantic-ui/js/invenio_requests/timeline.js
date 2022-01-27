import React, { Component } from "react";
import PropTypes from "prop-types";
import { RequestsApiClient } from "./api";
import { Container, Feed, Segment } from "semantic-ui-react";
import TimelineEvent from './timelineEvent';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = { timelineData: {}, loading: true, error: {} };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const client = new RequestsApiClient();
    const { url } = this.props;
    try {
      const response = await client.timeline(url);
      console.log("--------------------------")
      console.log(response.data);
      this.setState({ timelineData: response.data, loading: false });

    } catch (error) {
      console.error(error);
      this.setState({ error: error, loading: false });
    }
  };

  render() {
    const { timelineData } = this.state;
    return (
      <Container>
        <Segment>
          <Feed>
            {timelineData.hits?.hits.map(comment => (
              <TimelineEvent event={comment} key={comment.id} />
            ))}
          </Feed>
        </Segment>
      </Container>
    );
  }
}

Timeline.propTypes = {
  url: PropTypes.string.isRequired
};

export default Timeline;

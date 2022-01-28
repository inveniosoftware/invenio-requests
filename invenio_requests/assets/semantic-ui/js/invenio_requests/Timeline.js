import ErrorBoundary from "./components/Error";
import Loader from "./components/Loader";
import { withCancel } from "./api/config";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Feed, Segment } from "semantic-ui-react";
import TimelineEvent from "./TimelineEvent";
import Overridable from "react-overridable";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = { timelineData: {}, loading: true, error: {} };
  }

  componentWillUnmount() {
    this.cancellableFetchData && this.cancellableFetchData.cancel();
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { api } = this.props;
    try {
      this.cancellableFetchData = withCancel(api.getTimeline());
      const response = await this.cancellableFetchData.promise;
      this.setState({ timelineData: response.data, loading: false });
    } catch (error) {
      if (error !== "UNMOUNTED") {
        console.error(error);
        this.setState({ error: error, loading: false, timelineData: {} });
      }
    }
  };

  render() {
    const { timelineData, loading } = this.state;
    return (
      <Overridable id="InvenioRequests.Timeline.layout" {...this.props}>
        <Container>
          <Loader isLoading={loading}>
            <Segment>
              <Feed>
                {timelineData.hits?.hits.map((comment) => (
                  <TimelineEvent event={comment} key={comment.id} />
                ))}
              </Feed>
            </Segment>
          </Loader>
        </Container>
      </Overridable>
    );
  }
}

Timeline.propTypes = {
  api: PropTypes.object.isRequired,
};

export default Overridable.component("InvenioRequests.Timeline", Timeline);

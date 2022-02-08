import RequestHeader from "./request/RequestHeader";
import RequestMetadata from "./request/RequestMetadata";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Grid, Tab, Header, Image } from "semantic-ui-react";
import { Timeline } from "./timeline";

class RequestDetails extends Component {
  get menuPanes() {
    const { request } = this.props;
    return [
      {
        menuItem: "Conversation",
        render: () => (
          <Tab.Pane>
            <Container>
              <Grid stackable reversed="mobile">
                <Grid.Column width={13}>
                  <Timeline />
                </Grid.Column>
                <Grid.Column width={3}>
                  <RequestMetadata request={request} />
                </Grid.Column>
              </Grid>
            </Container>
          </Tab.Pane>
        ),
      },
      { menuItem: "Record", render: () => <Tab.Pane>Record</Tab.Pane> },
    ];
  }

  render() {
    const { request } = this.props;
    return (
      <Overridable id="InvenioRequests.RequestDetails.layout" {...this.props}>
        <>
          <RequestHeader request={request} />
          <Tab panes={this.menuPanes} />
        </>
      </Overridable>
    );
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object.isRequired,
};

export default Overridable.component(
  "InvenioRequests.RequestDetails",
  RequestDetails
);

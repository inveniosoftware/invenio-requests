import React, { Component } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Grid, Tab, Header, Image } from "semantic-ui-react";
import { Timeline } from './timeline';

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
                  <Header as="h4">Requester</Header>
                  <Image src="/static/images/placeholder.png" avatar rounded />
                  <span>{request.created_by.full_name}</span>
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
    return (
      <Overridable id="InvenioRequests.RequestDetails.layout" {...this.props}>
        <Tab panes={this.menuPanes} />
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

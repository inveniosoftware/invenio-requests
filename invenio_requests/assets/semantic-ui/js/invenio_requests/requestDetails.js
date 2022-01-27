import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Grid, Tab, Header, Image } from "semantic-ui-react";
import ReactDOM from "react-dom";
import Timeline from "./timeline";

const requestDetailsDiv = document.getElementById("request-detail");

class RequestDetails extends Component {
  get menuPanes() {
    const { request } = this.props;
    console.log(request);
    return [
      {
        menuItem: "Conversation",
        render: () => (
          <Tab.Pane>
            <Container>
              <Grid stackable reversed="mobile">
                <Grid.Column width={13}>
                  <Timeline url={request?.links?.timeline} />
                </Grid.Column>
                <Grid.Column width={3}>
                  <Header as="h4">Requester</Header>
                  <Image src="/static/images/placeholder.png" avatar rounded />
                  <span>{request.created_by.full_name}</span>
                </Grid.Column>

              </Grid>
            </Container>
          </Tab.Pane>
        )
      },
      { menuItem: "Record", render: () => <Tab.Pane>Record</Tab.Pane> }
    ];
  }

  render() {
    return <Tab panes={this.menuPanes} />;
  }
}

RequestDetails.propTypes = {
  request: PropTypes.object.isRequired,
};

ReactDOM.render(
  <RequestDetails request={JSON.parse(requestDetailsDiv.dataset.record)}

  />,
  requestDetailsDiv
);

export default RequestDetails;

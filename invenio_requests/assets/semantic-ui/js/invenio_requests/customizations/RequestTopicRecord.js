import CreatorList from "../components/CreatorList";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Header, Label } from "semantic-ui-react";

export default class RequestTopicRecord extends Component {
  render() {
    const { topic } = this.props;

    return (
      <Container>
        <Header as="h2">
          <Label color="green">New submission</Label>
          <span>{topic.metadata.title}</span>
        </Header>
        <CreatorList creators={topic.metadata.creators} />
      </Container>
    );
  }
}

RequestTopicRecord.propTypes = {
  topic: PropTypes.object.isRequired,
};

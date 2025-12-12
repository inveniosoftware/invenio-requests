// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
// Copyright (C) 2025 Graz University of Technology.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { i18next } from "@translations/invenio_requests/i18next";
import { Container, Grid, Label, Segment, Header } from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";

class LoadMore extends Component {
  render() {
    const { remaining, loading, loadNextAppendedPage } = this.props;
    return (
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
                  {i18next.t("{{remaining}} older comments", { remaining })}
                </Header>
                <Label
                  as="a"
                  size="large"
                  basic
                  color="blue"
                  className="borderless"
                  onClick={loadNextAppendedPage}
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
    );
  }
}

LoadMore.propTypes = {
  remaining: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  loadNextAppendedPage: PropTypes.func.isRequired,
};

export default Overridable.component("LoadMore", LoadMore);

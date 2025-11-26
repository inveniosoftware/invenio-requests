// This file is part of InvenioRequests
// Copyright (C) 2025 CERN.
//
// Invenio Requests is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Input, Container } from "semantic-ui-react";
import React from "react";
import { RequestEventAvatarContainer } from "./RequestsFeed";

const FakeInput = ({ placeholder, userAvatar, onActivate, className }) => {
  return (
    <div className={`requests-comment-fake-reply ${className}`}>
      <RequestEventAvatarContainer
        src={userAvatar}
        className="tablet computer only rel-mr-1"
      />
      <Container fluid>
        <Input
          placeholder={placeholder}
          fluid
          onClick={() => onActivate()}
          onChange={(e) => onActivate(e.target.value)}
          size="small"
        />
      </Container>
    </div>
  );
};

FakeInput.propTypes = {
  placeholder: PropTypes.string.isRequired,
  userAvatar: PropTypes.string,
  onActivate: PropTypes.func.isRequired,
  className: PropTypes.bool,
};

FakeInput.defaultProps = {
  userAvatar: "",
  className: "",
};

export default Overridable.component("InvenioRequests.FakeInput", FakeInput);

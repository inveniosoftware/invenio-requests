// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RichEditor } from "react-invenio-forms";
import React from "react";
import { SaveButton } from "../components/Buttons";
import { Container, Message } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_requests/i18next";
import { RequestEventAvatarContainer } from "../components/RequestsFeed";

const TimelineCommentEditor = ({
  isLoading,
  commentContent,
  setCommentContent,
  error,
  submitComment,
  userAvatar,
  charCount,
  commentContentMaxLength,
}) => {
  const isSubmitDisabled = () => isLoading || (charCount === 0) || (charCount >= commentContentMaxLength)
  return (
    <div className="timeline-comment-editor-container">
      {error && <Message negative>{error}</Message>}
      <div className="flex">
        <RequestEventAvatarContainer
          src={userAvatar}
          className="tablet computer only rel-mr-1"
        />
        <Container fluid className="ml-0-mobile mr-0-mobile fluid-mobile">
          <RichEditor
            inputValue={commentContent}
            onEditorChange={(event, editor) => {
              setCommentContent(editor.getContent());
            }}
            minHeight={150}
          />
        </Container>
      </div>
      <div className="text-align-right rel-mt-1">
        <SaveButton
          icon="send"
          size="medium"
          content={i18next.t("Comment")}
          disabled={isSubmitDisabled()}
          loading={isLoading}
          onClick={() => submitComment(commentContent, "html")}
        />
      </div>
    </div>
  );
};

TimelineCommentEditor.propTypes = {
  commentContent: PropTypes.string,
  isLoading: PropTypes.bool,
  setCommentContent: PropTypes.func.isRequired,
  error: PropTypes.string,
  submitComment: PropTypes.func.isRequired,
  userAvatar: PropTypes.string,
  charCount: PropTypes.number,
  commentContentMaxLength: PropTypes.number,
};

TimelineCommentEditor.defaultProps = {
  commentContent: "",
  isLoading: false,
  error: "",
  userAvatar: "",
  charCount: 0,
  commentContentMaxLength: 0,
};

export default TimelineCommentEditor;

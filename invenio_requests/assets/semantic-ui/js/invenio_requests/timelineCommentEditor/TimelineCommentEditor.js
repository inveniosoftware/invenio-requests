// This file is part of InvenioRequests
// Copyright (C) 2022-2025 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RichEditor } from "react-invenio-forms";
import React, { useCallback, useEffect, useState } from "react";
import { SaveButton } from "../components/Buttons";
import { Container, Message } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_requests/i18next";
import { RequestEventAvatarContainer } from "../components/RequestsFeed";
import { TimelineDraftSavingStatus } from "../components/TimelineDraftSavingStatus";

const TimelineCommentEditor = ({
  isLoading,
  commentContent,
  storedCommentContent,
  draftSavingStatus,
  restoreCommentContent,
  setCommentContent,
  error,
  submitComment,
  userAvatar,
}) => {
  useEffect(() => {
    restoreCommentContent();
  }, [restoreCommentContent]);

  const [showDraftStatus, setShowDraftStatus] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  // Show a reassuring "draft saved" message after the user stops typing.
  // In reality, the draft is saved immediately, but this feels more natural.
  const onEditorChange = useCallback(() => {
    setShowDraftStatus(false);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    const t = setTimeout(() => {
      setShowDraftStatus(true);
    }, 500);
    setTimeoutId(t);
  }, [timeoutId]);

  // Show "draft saved" if we already loaded a saved draft
  useEffect(() => {
    if (storedCommentContent !== null) {
      setShowDraftStatus(true);
    }
  }, [storedCommentContent]);

  return (
    <div className="timeline-comment-editor-container">
      {error && <Message negative>{error}</Message>}
      <div className="flex">
        <RequestEventAvatarContainer
          src={userAvatar}
          className="tablet computer only rel-mr-1"
        />
        <Container
          fluid
          className={`ml-0-mobile mr-0-mobile fluid-mobile${
            showDraftStatus ? " has-draft-status" : ""
          }`}
        >
          <RichEditor
            inputValue={commentContent}
            // initialValue is not allowed to change, so we use `storedCommentContent` which is set at most once
            initialValue={storedCommentContent}
            onEditorChange={(event, editor) => {
              setCommentContent(editor.getContent());
              onEditorChange();
            }}
            minHeight={150}
          />
          {showDraftStatus && <TimelineDraftSavingStatus status={draftSavingStatus} />}
        </Container>
      </div>
      <div className="text-align-right rel-mt-1">
        <SaveButton
          icon="send"
          size="medium"
          content={i18next.t("Comment")}
          loading={isLoading}
          onClick={() => submitComment(commentContent, "html")}
        />
      </div>
    </div>
  );
};

TimelineCommentEditor.propTypes = {
  commentContent: PropTypes.string,
  storedCommentContent: PropTypes.string,
  draftSavingStatus: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  setCommentContent: PropTypes.func.isRequired,
  error: PropTypes.string,
  submitComment: PropTypes.func.isRequired,
  restoreCommentContent: PropTypes.func.isRequired,
  userAvatar: PropTypes.string,
};

TimelineCommentEditor.defaultProps = {
  commentContent: "",
  storedCommentContent: null,
  isLoading: false,
  error: "",
  userAvatar: "",
};

export default TimelineCommentEditor;

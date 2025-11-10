// This file is part of InvenioRequests
// Copyright (C) 2022-2025 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RichEditor } from "react-invenio-forms";
import React, { useEffect, useRef } from "react";
import { SaveButton } from "../components/Buttons";
import { Container, Message } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_requests/i18next";
import { RequestEventAvatarContainer } from "../components/RequestsFeed";

// Make content inside the editor look identical to how we will render it in a comment.
// TinyMCE runs within an iframe, so we cannot style it with page-wide CSS styles as normal.
//
// TinyMCE overrides blockquotes with custom styles, so we need to use !important to override
// the overrides in a consistent and reliable way.
// https://github.com/tinymce/tinymce-dist/blob/8d7491f2ee341c201b68cc7c3701d54703edd474/skins/content/tinymce-5/content.css#L61-L70
//
// The body styles are included in the `content_style` in RichEditor, so we need to include it here too.
const editorContentStyle = `
body {
  font-size: 14px;
}

blockquote  {
  margin-left: 0.5rem !important;
  padding-left: 0.75rem !important;
  color: #757575;
  border-left: 4px solid #C5C5C5 !important;
}

blockquote > blockquote {
  margin-left: 0 !important;
}
`;

const TimelineCommentEditor = ({
  isLoading,
  commentContent,
  storedCommentContent,
  restoreCommentContent,
  setCommentContent,
  appendedCommentContent,
  error,
  submitComment,
  userAvatar,
}) => {
  useEffect(() => {
    restoreCommentContent();
  }, [restoreCommentContent]);

  const editorRef = useRef(null);
  useEffect(() => {
    if (!appendedCommentContent || !editorRef.current) return;
    // Move the caret to the end of the body and focus the editor.
    // See https://www.tiny.cloud/blog/set-and-get-cursor-position/#h_48266906174501699933284256
    editorRef.current.selection.select(editorRef.current.getBody(), true);
    editorRef.current.selection.collapse(false);
    editorRef.current.focus();
  }, [appendedCommentContent]);

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
            // initialValue is not allowed to change, so we use `storedCommentContent` which is set at most once
            initialValue={storedCommentContent}
            onEditorChange={(_, editor) => {
              setCommentContent(editor.getContent());
            }}
            minHeight={150}
            onInit={(_, editor) => (editorRef.current = editor)}
            editorConfig={{
              content_style: editorContentStyle,
            }}
          />
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
  appendedCommentContent: PropTypes.string,
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
  appendedCommentContent: "",
  isLoading: false,
  error: "",
  userAvatar: "",
};

export default TimelineCommentEditor;

import React, { useState, useRef } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import { renderMarkdown } from "components/Article/RenderMarkdown";
import { renderDomAsMarkdown } from 'utils/DOMIntoMarkdown';

import styles from 'pages/Admin/Admin.module.scss';
import Button from 'components/Form/Button';
import { uploadImage } from 'utils/functions';

export function RichTextEditor({ submissionHandler, currentArticle }) {
  const editableTitleDOMRef = useRef();
  const editableAreaDOMRef = useRef();

  const editModeInlineStyle = { 
    borderColor: "black",
    borderWidth: "1px",
    margin: "0.3em",
    borderStyle: "solid",
  };

  return (
    <>
      <h1 className={styles.title} contentEditable={(currentArticle) ? "false" : "true"} ref={editableTitleDOMRef}>
        {(currentArticle) ? currentArticle.name : "Edit New Title"}
      </h1>
      <div style={editModeInlineStyle}>
        <div
          contentEditable={true}
          className={styles.article}
          dangerouslySetInnerHTML={
            { __html: renderMarkdown(preprocessMarkdown((currentArticle) ? currentArticle.content : "Begin typing your article.")) }
          }
          ref={editableAreaDOMRef}>
        </div>
      </div>
      <br></br>
      <Button
      onClick={
        function() {
          if (editableAreaDOMRef.current && editableTitleDOMRef) {
            const markdownText = renderDomAsMarkdown(editableAreaDOMRef.current);
            submissionHandler({ name: (currentArticle) ? currentArticle.name : editableTitleDOMRef.current.textContent , content: markdownText });
          }
        }
      }>
        {(currentArticle)
          ? "Save Article"
          : "Submit Article"}
      </Button>
    </>
  );
}
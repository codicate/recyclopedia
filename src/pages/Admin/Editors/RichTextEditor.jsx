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

  function executeRichTextCommand(commandName, optionalArgument) {
    if (editableAreaDOMRef.current) {
        document.execCommand(commandName, false, optionalArgument);
        editableAreaDOMRef.current.focus();
    }
  }

  const toolBarRichWidgets = {
    bold: { name: "Bold", display: <b>B</b>, command: "bold" },
    italic: { name: "Italic", display: <emph>I</emph>, command: "italic" },
    underline: { name: "Underline", display: <u>UL</u>, command: "underline" },
    h1: { name: "Heading 1", display: <b>h1</b>, command: "heading", argument: "H1", },
    h2: { name: "Heading 2", display: <b>h2</b>, command: "heading", argument: "H2", },
    h3: { name: "Heading 3", display: <b>h3</b>, command: "heading", argument: "H3", },
    h4: { name: "Heading 4", display: <b>h4</b>, command: "heading", argument: "H4", },
    h5: { name: "Heading 5", display: <b>h5</b>, command: "heading", argument: "H5", },
    h6: { name: "Heading 6", display: <b>h6</b>, command: "heading", argument: "H6", },
    orderedList: { name: "Ordered List", command: "insertorderedlist", },
    unorderedList: { name: "Unordered List", command: "insertunorderedlist", },
  };

  const editModeInlineStyle = { 
    borderColor: "black",
    borderWidth: "1px",
    margin: "0.3em",
    borderStyle: "solid",
  };

  return (
    <>
      <div> {/*requires styling*/}
        {
          Object.entries(toolBarRichWidgets).map(
            ([widgetId, widget]) => (<button 
            key={widgetId} 
            id={widgetId} 
            onClick={
              (_) => {
                if (widget.argument) {
                  executeRichTextCommand(widget.command, widget.argument);
                } else {
                  executeRichTextCommand(widget.command);
                }
              }
            }>{ (widget.display) ? widget.display : widget.name}</button>)
          )
        }
      </div>
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
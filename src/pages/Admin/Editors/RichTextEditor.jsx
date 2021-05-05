import React, { useState, useRef } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import { renderMarkdown } from "components/Article/RenderMarkdown";
import { renderDomAsMarkdown } from 'utils/DOMIntoMarkdown';
import { dictionaryUpdateKey, dictionaryUpdateKeyNested } from 'utils/functions';

import styles from 'pages/Admin/Admin.module.scss';
import Button from 'components/Form/Button';

// The DOM to Markdown Parsers assumes that this is the case, always.
document.execCommand("defaultParagraphSeparator", false, "p");
export function RichTextEditor({ submissionHandler, currentArticle }) {
  const editableTitleDOMRef = useRef();
  const editableAreaDOMRef = useRef();

  const [widgetStates, updateWidgetState] = useState({
    heading: {
      active: null,
      types: {
        h1: { name: "Heading 1", display: <b>h1</b>, command: "heading", argument: "H1", category: "heading" },
        h2: { name: "Heading 2", display: <b>h2</b>, command: "heading", argument: "H2", category: "heading" },
        h3: { name: "Heading 3", display: <b>h3</b>, command: "heading", argument: "H3", category: "heading" },
        h4: { name: "Heading 4", display: <b>h4</b>, command: "heading", argument: "H4", category: "heading" },
        h5: { name: "Heading 5", display: <b>h5</b>, command: "heading", argument: "H5", category: "heading" },
        h6: { name: "Heading 6", display: <b>h6</b>, command: "heading", argument: "H6", category: "heading" },
      }
    },
    list: {
      active: null,
      types: {
        orderedList: { name: "Ordered List", command: "insertorderedlist", category: "list" },
        unorderedList: { name: "Unordered List", command: "insertunorderedlist", category: "list" },
      }
    },
    // disadvantage at the moment. You don't have to do this, but this makes the current format work without code changes
    bold: {
      active: null,
      types: {
        bold: { name: "Bold", display: <b>B</b>, command: "bold" }
      }
    },
    italic: {
      active: null,
      types: {
        italic: { name: "Italic", display: <emph>I</emph>, command: "italic" }
      }
    },
    underline: {
      active: null,
      types: {
        underline: { name: "Underline", display: <u>UL</u>, command: "underline" }
      }
    },
  });

  function flattenWidgetStateTypes() {
    return Object.entries(widgetStates).reduce(
      function (accumulator, [id, { types }]) {
        return Object.entries(types).reduce(
          function (accumulator, [key, value]) {
            // can probably use updateKeyValue, but not trying it here.
            let copy = { ...accumulator };
            copy[key] = value;
            return copy;
          },
          accumulator
        );
      }
      , {});
  }

  function executeRichTextCommand(commandName, optionalArgument) {
    if (editableAreaDOMRef.current) {
        document.execCommand(commandName, false, optionalArgument);
        editableAreaDOMRef.current.focus();
    }
  }

  function queryRichTextCommand(command, wantedValue) {
    if (wantedValue) {
      return document.queryCommandValue(command);
    } else {
      return document.queryCommandState(command);
    }
  }

  function synchronizeCommandStateToWidgetBar() {
    updateWidgetState(
      Object.keys(widgetStates).reduce(
        (newWidgetState, type) => {
          return dictionaryUpdateKeyNested(newWidgetState, [type, "active"],
            (type === "heading") ?
              () => queryRichTextCommand(type, true) :
              () => queryRichTextCommand(type) ? type : null
          );
        }, widgetStates)
    );
  }

  const editModeInlineStyle = { 
    borderColor: "black",
    borderWidth: "1px",
    margin: "0.3em",
    borderStyle: "solid",
  };

  const activeWidgetCategory = {
    color: "red",
    backgroundColor: "blue",
  };

  return (
    <>
      <div> {/*requires styling*/}
        {
          Object.entries(flattenWidgetStateTypes()).map(
            ([widgetId, widget]) => (<button
              key={widgetId}
              id={widgetId}
              style={ 
                ((widgetStates[(widget.category !== undefined) ? widget.category : widgetId].active) === widgetId)
                  ? activeWidgetCategory : {}}
              onClick={
                (_) => {
                  const key = (widget.category) ? widget.category : widgetId;
                  updateWidgetState(
                    dictionaryUpdateKeyNested(
                      widgetStates,
                      [key, "active"],
                      (currentlyActive) => (currentlyActive === widgetId) ? null : widgetId
                    )
                  );

                  executeRichTextCommand(widget.command, widget.argument);
                }
              }>{(widget.display) ? widget.display : widget.name}</button>)
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
          onSelect={synchronizeCommandStateToWidgetBar}
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
            // oddity, that this returns an array for mysterious reasons.
            const markdownText = renderDomAsMarkdown(editableAreaDOMRef.current)[0];
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
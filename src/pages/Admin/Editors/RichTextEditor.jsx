import React, { useState, useRef } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import { renderMarkdown } from "components/Article/RenderMarkdown";
import { renderDomAsMarkdown } from 'utils/DOMIntoMarkdown';
import { dictionaryUpdateKey, dictionaryUpdateKeyNested } from 'utils/functions';

import styles from 'pages/Admin/Admin.module.scss';
import noticeBannerStyles from './NoticeBanner.module.scss';

import Button from 'components/Form/Button';

const widgets = {
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
};

function NoticeBanner({children, dirtyFlag}) {
  const styles = [noticeBannerStyles.dropOut, noticeBannerStyles.dropIn];

  const [selfDirtyFlag, updateSelfDirtyFlag] = useState(dirtyFlag);
  const [style, updateStyle] = useState(0);

  if (dirtyFlag !== selfDirtyFlag) {
      updateStyle((style+1));
      updateSelfDirtyFlag(!selfDirtyFlag);
  }

  return (
    <div className={noticeBannerStyles.main + " " + styles[style % 2]}>
      {children}
    </div>
  );
}
/*
  I'm actually not 100% sure of how we should `data-bind` two separate representations of the same document. Ideally we
  should really only pick one as the source of truth, and the more convenient one to pick is markdown.

  This is technically experimental anyways.
*/
export function RichTextEditor({ submissionHandler, currentArticle }) {
  const editableTitleDOMRef = useRef();
  const editableAreaDOMRef = useRef();

  document.execCommand("defaultParagraphSeparator", false, "p");
  const [widgetStates, updateWidgetState] = useState(widgets);
  const [dirtyFlag, updateDirtyFlag] = useState(false);

  function saveDocument() {
    if (editableAreaDOMRef.current && editableTitleDOMRef) {
      const markdownText = renderDomAsMarkdown(editableAreaDOMRef.current);
      submissionHandler({ name: (currentArticle) ? currentArticle.name : editableTitleDOMRef.current.textContent, content: markdownText });
      updateDirtyFlag(false);
    }
  }

  // would only apply to a few relevant states.
  function toggleWidgetActiveState(widgetId, categoryValue) {
    updateWidgetState(
      dictionaryUpdateKeyNested(
        widgetStates,
        [(categoryValue) ? (categoryValue) : (widgetId), "active"],
        (currentlyActive) => (currentlyActive === widgetId) ? null : widgetId
      )
    );
  }

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
                  toggleWidgetActiveState(widgetId, widget.category);
                  executeRichTextCommand(widget.command, widget.argument);
                }
              }>{(widget.display) ? widget.display : widget.name}</button>)
          )
        }
      </div>
      <NoticeBanner dirtyFlag={dirtyFlag}>You have unsaved changes!</NoticeBanner> : <></>
      <h1 className={styles.title} contentEditable={(currentArticle) ? "false" : "true"} ref={editableTitleDOMRef}>
        {(currentArticle) ? currentArticle.name : "Edit New Title"}
      </h1>
      <div style={editModeInlineStyle}>
        <div
          contentEditable={true}
          className={styles.article}
          onSelect={synchronizeCommandStateToWidgetBar}
          onKeyDown={
            // I would hipster write this too, but I'll just write this in a simple fashion
            function(event) {
              let {key, shiftKey, ctrlKey} = event;
              let disableDefaultBehavior = false;
              if (ctrlKey) {
                if (!shiftKey) {
                  switch (key) {
                    case 's':
                      saveDocument();
                      disableDefaultBehavior = true;
                      break;
                    case 'b':
                      toggleWidgetActiveState("bold");
                      executeRichTextCommand("bold");
                      disableDefaultBehavior = true;
                      break;
                    case 'i':
                      toggleWidgetActiveState("italic");
                      executeRichTextCommand("italic");
                      disableDefaultBehavior = true;
                      break;
                    case 'u':
                      toggleWidgetActiveState("underline");
                      executeRichTextCommand("underline");
                      disableDefaultBehavior = true;
                      break;
                    case '1': case '2': case '3': case '4': case '5': case '6':
                      toggleWidgetActiveState(`h${key}`, "heading");
                      executeRichTextCommand("heading", `H${key}`);
                      disableDefaultBehavior = true;
                      break;
                  }
                } else {
                  console.log("CTRL and SHIFT", key);
                  switch (key) {
                    case 'U':
                      console.log("unordered list");
                      executeRichTextCommand("insertunorderedlist");
                      disableDefaultBehavior = true;
                      break;
                    case 'O':
                      executeRichTextCommand("insertorderedlist");
                      disableDefaultBehavior = true;
                      break;
                  }
                }
              }

              if (disableDefaultBehavior) {
                event.preventDefault();
                event.stopPropagation();
              } else {
                updateDirtyFlag(true);
              }
            }
          }
          dangerouslySetInnerHTML={
            { __html: renderMarkdown(preprocessMarkdown((currentArticle) ? currentArticle.content : "Begin typing your article.")) }
          }
          ref={editableAreaDOMRef}>
        </div>
      </div>
      <br></br>
      <Button onClick={saveDocument}>
        {(currentArticle)
          ? "Save Article"
          : "Submit Article"}
      </Button>
    </>
  );
}
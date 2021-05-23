import { useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectArticlesData, insertArticle } from 'app/articlesSlice';

import { NoticeBanner } from './Editors/NoticeBanner.jsx';
import { MarkdownEditor } from "./Editors/MarkdownEditor";
import { RichTextEditor } from "./Editors/RichTextEditor";
import { TagEditor } from 'pages/Admin/TagEditor.jsx';


function submitHandler(input, dispatch, onFinishedCallback) {
  dispatch(insertArticle(input));

  if (onFinishedCallback) {
    onFinishedCallback(input);
  }
}

export default function Admin({ currentArticle }) {
  const dispatch = useAppDispatch();

  const [editorMode, setEditorMode] = useState("richtext");
  const [dirtyFlag, updateDirtyFlag] = useState(false);
  const [draftStatus, updateDraftStatus] = useState(
    (currentArticle === undefined)
      ? false
      : (currentArticle.draftStatus === undefined)
        ? false
        : currentArticle.draftStatus
  );

  const submissionHandler = function (submissionData) {
    submitHandler(
      { ...submissionData, draftStatus: draftStatus },
      dispatch,
      function ({ name, content }) {
        console.log(`Article ${name} written!`);
        updateDirtyFlag(false);
      });
  };

  return (
    <>
      <select
        value='richtext'
        onChange={
          function (event) {
            setEditorMode(event.target.value);
          }
        }>
        <option value="markdown">Manual Markdown Editor</option>
        <option value="richtext">Experimental Rich Text Editor</option>
      </select>

      <h2>{(draftStatus) ? "DRAFT*" : "WILL PUBLISH ON SAVE"}</h2>
      <NoticeBanner dirtyFlag={dirtyFlag}>You have unsaved changes!</NoticeBanner>

      {(
        editorMode === "richtext"
      ) ? (
        <RichTextEditor
          submissionHandler={submissionHandler}
          currentArticle={currentArticle}
          updateDirtyFlag={updateDirtyFlag}
          toggleDraftStatus={() => updateDraftStatus(!draftStatus)} >
        </RichTextEditor>
      ) : (
        <MarkdownEditor
          submissionHandler={submissionHandler}
          currentArticle={currentArticle}
          updateDirtyFlag={updateDirtyFlag}
          toggleDraftStatus={() => updateDraftStatus(!draftStatus)} >
        </MarkdownEditor>
      )}

      {/* <TagEditor currentArticle={currentArticle}/> */}
    </>
  );
}
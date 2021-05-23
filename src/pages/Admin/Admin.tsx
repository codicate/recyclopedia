import { useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectArticlesData, insertArticle, Article } from 'app/articlesSlice';

import { NoticeBanner } from './Editors/NoticeBanner.jsx';
import { MarkdownEditor } from "./Editors/MarkdownEditor";
import { RichTextEditor } from "./Editors/RichTextEditor";
import { TagEditor } from 'pages/Admin/TagEditor.jsx';


export default function Admin({
  currentArticle
}: {
  currentArticle?: Article;
}) {
  const dispatch = useAppDispatch();
  const articlesData = useAppSelector(selectArticlesData);

  const [editorMode, setEditorMode] = useState("richtext");
  const [dirtyFlag, updateDirtyFlag] = useState(false);

  const [draftStatus, updateDraftStatus] = useState(
    (currentArticle === undefined)
      ? false
      : (currentArticle.draftStatus === undefined)
        ? false
        : currentArticle.draftStatus
  );

  type OnFinishedCallback = (submissionData: Article) => void;

  function submitHandler(
    input: Article,
    onFinishedCallback: (input: Article) => void
  ) {
    // setArticlesData({
    //   ...articlesData,
    //   articles: articlesData.articles.map(item => ({
    //     name: item.name,
    //     content: (item.name === input.name) ? input.content : item.content,
    //   }))
    // });

    dispatch(insertArticle(input));

    if (onFinishedCallback) {
      onFinishedCallback(input);
    }
  };

  const submissionHandler = (
    submissionData: {
      name: string;
      content: string;
    }
  ) => {
    submitHandler(
      { ...submissionData, draftStatus: draftStatus },
      ({ name, content }) => {
        console.log(`Article ${name} written!`);
        updateDirtyFlag(false);
      }
    );
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
          toggleDraftStatus={() => updateDraftStatus(!draftStatus)}
        />
      ) : (
        <MarkdownEditor
          submissionHandler={submissionHandler}
          currentArticle={currentArticle}
          updateDirtyFlag={updateDirtyFlag}
          toggleDraftStatus={() => updateDraftStatus(!draftStatus)}
        />
      )}

      {/* <TagEditor articlesData={articlesData} setArticlesData={setArticlesData} currentArticle={currentArticle}/> */}
    </>
  );
}
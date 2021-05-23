import { useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectArticlesData, insertArticle } from 'app/articlesSlice';

import { MarkdownEditor } from "./Editors/MarkdownEditor";
import { RichTextEditor } from "./Editors/RichTextEditor";

function submitHandler(currentArticle, input, dispatch, onFinishedCallback) {
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
}

export default function Admin({ currentArticle }) {
  const dispatch = useAppDispatch();
  const articlesData = useAppSelector(selectArticlesData);
  const submissionHandler = function (submissionData) {
    submitHandler(
      currentArticle,
      submissionData,
      dispatch,
      function ({ name, content }) {
        console.log(`Article ${name} written!`);
      });
  };
  const editorMarkdown = (
    <MarkdownEditor
      submissionHandler={submissionHandler}
      currentArticle={currentArticle}>
    </MarkdownEditor>
  );
  const editorRichText = (
    <RichTextEditor
      submissionHandler={submissionHandler}
      currentArticle={currentArticle}>
    </RichTextEditor>
  );
  const [editorMode, setEditorMode] = useState(editorRichText);
  return (
    <>
      <select
        value='richtext'
        onChange={
          function (event) {
            switch (event.target.value) {
              case "richtext":
                setEditorMode(editorRichText);
                break;
              case "markdown":
              default:
                setEditorMode(editorMarkdown);
                break;
            }
          }
        }>
        <option value="markdown">Manual Markdown Editor</option>
        <option value="richtext">Experimental Rich Text Editor</option>
      </select>
      {editorMode}
    </>);
}

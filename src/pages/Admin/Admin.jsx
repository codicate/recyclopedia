import React, { useState } from 'react';
import { MarkdownEditor } from "./Editors/MarkdownEditor";
import { RichTextEditor } from "./Editors/RichTextEditor";

import { TagEditor } from 'pages/Admin/TagEditor.jsx';

function submitHandler({ api, articlesData, setArticlesData, currentArticle }, input, onFinishedCallback) {
  setArticlesData({
    ...articlesData,
    articles: articlesData.articles.map(item => ({
      name: item.name,
      content: (item.name === input.name) ? input.content : item.content,
    }))
  });

  (async function () {
    await api.insertArticle(input);
    if (onFinishedCallback) {
      onFinishedCallback(input);
    }
    let result = await api.queryForArticles();
    setArticlesData(result);
  })();
}

export default function Admin({ api, articlesData, setArticlesData, currentArticle }) {
  const submissionHandler = function (submissionData) {
    submitHandler(
      { api, articlesData, setArticlesData, currentArticle, },
      submissionData,
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
        <option value="richtext" selected>Experimental Rich Text Editor</option>
      </select>
      {editorMode}
      <TagEditor articlesData={articlesData} setArticlesData={setArticlesData} currentArticle={currentArticle}/>
    </>);
}

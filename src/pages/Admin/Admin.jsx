import React, { useState } from 'react';
import { NoticeBanner } from './Editors/NoticeBanner.jsx';

import { MarkdownEditor } from "./Editors/MarkdownEditor";
import { RichTextEditor } from "./Editors/RichTextEditor";

function submitHandler({ api, articlesData, setArticlesData, currentArticle }, input, onFinishedCallback) {
    (async function () {
        setArticlesData({
            ...articlesData,
            articles: articlesData.articles.map(item => ({
                name: item.name,
                content: (item.name === input.name) ? input.content : item.content,
                draftStatus: (item.name === input.name) ? input.draftStatus : item.draftStatus,
            }))
        });

        await api.insertArticle(input,
                          function() {
                              if (onFinishedCallback) {
                                  onFinishedCallback(input);
                              }
                              api.queryForArticles().then(
                                  function(result) {
                                      setArticlesData(result);
                                  }
                              );
                          });
    })();
}

export default function Admin({ api, articlesData, setArticlesData, currentArticle }) {
    const [dirtyFlag, updateDirtyFlag] = useState(false);
    const [draftStatus, updateDraftStatus] = useState((currentArticle.draftStatus === undefined) ? false : currentArticle.draftStatus);

    const submissionHandler = function (submissionData) {
        submitHandler(
            { api, articlesData, setArticlesData, currentArticle, },
            {... submissionData, draftStatus: draftStatus},
            function ({ name, content }) {
                console.log(`Article ${name} written!`);
                updateDirtyFlag(false);
            });

    };

    const [editorMode, setEditorMode] = useState("richtext");

    return (
        <>
          <select
            onChange={
                function (event) {
                    setEditorMode(event.target.value);
                }
            }>
            <option value="markdown">Manual Markdown Editor</option>
            <option value="richtext" selected>Experimental Rich Text Editor</option>
          </select>
          <h2>{(draftStatus) ? "DRAFT*" : "WILL PUBLISH ON SAVE"}</h2>
          <NoticeBanner dirtyFlag={dirtyFlag}>You have unsaved changes!</NoticeBanner>
          {
              (editorMode === "richtext") ?
                  (
                      <RichTextEditor
                        submissionHandler={submissionHandler}
                        currentArticle={currentArticle}
                        updateDirtyFlag={updateDirtyFlag}
                        toggleDraftStatus={() => updateDraftStatus(!draftStatus)} >
                      </RichTextEditor>
                  )
                  :
                  (
                      <MarkdownEditor
                        submissionHandler={submissionHandler}
                        currentArticle={currentArticle}
                        updateDirtyFlag={updateDirtyFlag}
                        toggleDraftStatus={() => updateDraftStatus(!draftStatus)} > 
                      </MarkdownEditor>
                  )
          }
          {/* <TagEditor articlesData={articlesData} setArticlesData={setArticlesData} currentArticle={currentArticle}/> */}
        </>);
}

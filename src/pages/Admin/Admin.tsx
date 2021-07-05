import { useState } from "react";

import { useAppDispatch } from "app/hooks";
import { insertArticle, Article, ArticleDraft } from "app/articlesSlice";

import { NoticeBanner } from "./Editors/NoticeBanner";
import { RichTextEditor } from "./Editors/RichTextEditor";

export default function Admin({
  currentArticle
}: {
  currentArticle?: Article;
}) {
  const dispatch = useAppDispatch();
  const [dirtyFlag, updateDirtyFlag] = useState(false);

  const [draftStatus, updateDraftStatus] = useState((currentArticle) ? currentArticle.draftStatus : false);

  function submitHandler(input: Article, onFinishedCallback?: (input: Article) => void) {
    dispatch(insertArticle(input));
    onFinishedCallback?.(input);
  }

  const submissionHandler = (submissionData: ArticleDraft) => {
    submitHandler(
      {
        name: submissionData.name,
        content: submissionData.content,
        dateCreated: (submissionData.dateCreated) ? submissionData.dateCreated : new Date(),
        likeCount: 0,
        dislikeCount: 0,
        dateModified: new Date(),
        draftStatus: draftStatus,
        tags: submissionData.tags,
      },
      ({ name }) => {
        console.log(`Article ${name} written!`);
        updateDirtyFlag(false);
      }
    );
  };

  return (
    <>
      <h2>{(draftStatus) ? "DRAFT*" : "WILL PUBLISH ON SAVE"}</h2>
      <NoticeBanner dirtyFlag={dirtyFlag}>You have unsaved changes!</NoticeBanner>
      <RichTextEditor
        submissionHandler={submissionHandler}
        currentArticle={currentArticle}
        updateDirtyFlag={updateDirtyFlag}
        toggleDraftStatus={() => updateDraftStatus(!draftStatus)}
      />

      {/* <TagEditor currentArticle={currentArticle}/> */}
    </>
  );
}

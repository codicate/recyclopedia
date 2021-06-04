import { useState } from 'react';

import { useAppDispatch } from 'app/hooks';
import { insertArticle, Article } from 'app/articlesSlice';

import { NoticeBanner } from './Editors/NoticeBanner';
import { RichTextEditor } from "./Editors/RichTextEditor";
// import { TagEditor } from 'pages/Admin/TagEditor';

export default function Admin({
  currentArticle
}: {
  currentArticle?: Article;
}) {
  const dispatch = useAppDispatch();
  const [dirtyFlag, updateDirtyFlag] = useState(false);

  const [draftStatus, updateDraftStatus] = useState((currentArticle?.draftStatus));

  function submitHandler(input: Article, onFinishedCallback?: (input: Article) => void) {
    dispatch(insertArticle(input));
    onFinishedCallback?.(input);
  };

  const submissionHandler = (
    submissionData: {
      name: string;
      content: string;
    }
  ) => {
    submitHandler(
      { ...submissionData, draftStatus: !!draftStatus },
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

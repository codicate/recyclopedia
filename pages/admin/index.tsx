import { useEffect, useState } from "react";
import { useRouter } from 'next/router';

import { useAppSelector, useAppDispatch } from "lib/global/hooks";
import { selectLoginType, LoginType } from "lib/global/adminSlice";
import { ArticleModel } from "lib/models";
import { insertArticle, ArticleDraft } from "lib/global/articlesSlice";

import { NoticeBanner } from "components/Editors/NoticeBanner";
import { RichTextEditor } from "components/Editors/RichTextEditor";


function Admin({
  currentArticle
}: {
  currentArticle?: ArticleModel;
}) {
  const dispatch = useAppDispatch();
  const [dirtyFlag, updateDirtyFlag] = useState(false);

  const [draftStatus, updateDraftStatus] = useState((currentArticle) ? currentArticle.draftStatus : false);

  function submitHandler(
    input: ArticleModel,
    onFinishedCallback?: (input: ArticleModel) => void
  ) {
    dispatch(insertArticle(input));
    onFinishedCallback?.(input);
  }

  const submissionHandler = (submissionData: ArticleDraft) => {
    submitHandler(
      {
        name: submissionData.name,
        content: submissionData.content,
        dateCreated: (submissionData.dateCreated) ? submissionData.dateCreated : new Date().getTime(),
        votes: [],
        dateModified: new Date().getTime(),
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
      <NoticeBanner dirtyFlag={dirtyFlag}>
        You have unsaved changes!
      </NoticeBanner>
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

const AdminRedirect = ({
  currentArticle
}: {
  currentArticle?: ArticleModel;
}) => {
  const router = useRouter();
  const currentLoginType = useAppSelector(selectLoginType);

  useEffect(() => {
    (currentLoginType !== LoginType.Admin)
      && router.push(`/`);
  }, [currentLoginType, router]);

  return <Admin currentArticle={currentArticle} />;
};

export default AdminRedirect;
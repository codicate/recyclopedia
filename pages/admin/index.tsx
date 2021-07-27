import { useEffect, useState } from "react";
import { useRouter } from 'next/router';

import { useAppSelector, useAppDispatch } from "lib/state/hooks";
import { selectLoginType, LoginType } from "lib/state/admin";
import { ArticleModel } from "lib/models";
import { insertArticle, ArticleDraft } from "lib/state/articles";

import { NoticeBanner } from "components/Editors/NoticeBanner";
import { RichTextEditor } from "components/Editors/RichTextEditor";


function Admin({
  currentArticle
}: {
  currentArticle?: ArticleModel;
}) {
  /*
    useAppDispatch();
    const asd = useAppDispatch(); // it will try to login automatically
    
    var tried_to_login;
    function useAppDispatch() {
      const real_dispatch = useAppDispatch;

      // lazy load
      if (user.realm.not_logged_in && !tried_to_login) {
        tried_to_login = true;
        real_dispatch(initApi()); // don't await
      }

      return real_dispatch;
    }
  */
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
        dateCreated: (submissionData.dateCreated) ? submissionData.dateCreated : new Date(),
        votes: [],
        dateModified: new Date(),
        draftStatus: draftStatus,
        tags: submissionData.tags,
        comments: []
      },
      (article) => {
        console.log(`Article ${article.name} written!`);
        console.log(article);
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
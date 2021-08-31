import styles from "components/Article/Article.module.scss";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";

import { useAppSelector, useAppDispatch } from "state/hooks";
import { LoginType, selectLoginType } from "state/admin";
import { VoteType, ArticleModel, VoteModel } from 'lib/models';

// NOTE(jerry):
// this still fetches from mongodb realm!
import {
  queryForArticles,
  getCommentsOfArticle,
  getVotesOfArticle,
  migrateArticle,
  deleteArticle,
  restoreArticle,
  articleVote,
  useEffectWithGuaranteedInitializedApi,
} from "state/articles";

import { validPageLink } from "lib/functions";
import { preprocessMarkdown } from "utils/preprocessMarkdown";

import Admin from "pages/admin";
import FloatingSocialMenu from "./FloatingSocialMenu";
import Banner from "./Banner";
import TableOfContents from "./TableOfContents";
import TagViews from "./TagViews";

import Input from "components/Form/Input";
import Button from "components/UI/Button";
import MarkdownRender from "components/Article/MarkdownRender";
import { TopLevelCommentModel } from "components/Comment/Comment";
import CommentSection from "components/Comment/CommentSection";

enum PageViewType {
  Reading,
  Editting,
  Migration,
}

interface ArticleProperties {
  inRecycling: boolean,
  article: ArticleModel,
}

function ArticleComponent({ article, inRecycling }: ArticleProperties) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType) || LoginType.Anonymous;
  const isAdmin = currentLoginType === LoginType.Admin;

  const {
    name,
    content,
    // dateCreated,
    // dateModified,
    created_at,
    updated_at,
  } = article;

  const [migrationTitleName, updateMigrationTitleName] = useState(name);

  const [lastViewType, updateLastViewType] = useState(PageViewType.Reading);
  const [viewType, updateViewType] = useState(PageViewType.Reading);

  const processedMarkdown = preprocessMarkdown(content);

  const commentSectionRef = useRef<HTMLDivElement>(null);

  const [comments, updateComments] = useState<TopLevelCommentModel[]>([]);
  const [votes, updateVotes]       = useState<VoteModel[]>([]);

  // We don't have direct notifications, and honestly in real time comments that can be
  // probably hectic. So this is the best thing I could think of. This is called when you reply
  // or comment.
  const [commentPinger, _ucp] = useState(0);
  function refetchComments() {
    _ucp(commentPinger + 1);
  }
  // this won't be a dispatch I suppose.
  useEffectWithGuaranteedInitializedApi(dispatch,
    (async () => {
      dispatch(queryForArticles(undefined));
      const retrievedComments = await getCommentsOfArticle(name);
      const retrievedVotes    = await getVotesOfArticle(name);
      updateComments(retrievedComments);
      updateVotes(retrievedVotes);
    }), [commentPinger]);

  function toggleView(target: PageViewType) {
    if (viewType !== target) {
      updateViewType(target);
      updateLastViewType(viewType);
    } else {
      updateViewType(lastViewType);
    }
  }

  const standardAdminControls = (
    <>
      <Button
        styledAs="oval"
        onClick={() => toggleView(PageViewType.Editting)}
      >
        Edit This Page
      </Button>
      <Button
        onClick={() => toggleView(PageViewType.Migration)}
        styledAs="oval">
        Migrate Page
      </Button>
    </>
  );

  const recyclingAdminControls = (
    <>
      <Button
        styledAs="oval"
        onClick={async () => {
          if (confirm("Do you want to restore this article?")) {
            await dispatch(restoreArticle(name));
            router.push(validPageLink(name));
          }
        }}
      >
        Restore Article
      </Button>
    </>
  );

  return <>
    {
      (isAdmin) && (
        <div id={styles.articleControls}>
          {(!inRecycling) ? standardAdminControls : recyclingAdminControls}
          <Button
            styledAs="oval-danger"
            onClick={() => {
              if (confirm((inRecycling) ? "Permenantly delete this article?" : "Recycle this article?")) {
                dispatch(deleteArticle(name));
                router.push("/");
              }
            }}
          >
            Delete Page
          </Button>

        </div>
      )
    }
    {(() => {
      switch (viewType) {
        case PageViewType.Reading:
          return (
            <>
              {
                  <FloatingSocialMenu
                    title={name}
                    commentSectionRef={commentSectionRef}
                    votes={votes}
                    vote={
                      async function (vote: VoteType) {
                        await articleVote(currentLoginType, name, vote);
                        refetchComments();
                      }
                    }
                  />
              }

              {(article?.bannerImage) && (
                <Banner bannerImage={article.bannerImage}></Banner>
              )}

              <h1 className={styles.title}> {name} </h1>
              <div className={styles.dateView}>
                <p>
                  Created at {format(new Date(created_at), "LLLL d, yyyy, h:mm a")}
                </p>
                {(updated_at) && (
                  <p>
                    Last Modified at {format(new Date(updated_at), "LLLL d, yyyy, h:mm a")}
                  </p>
                )}
              </div>
              <TableOfContents sectionHeaders={processedMarkdown.headers} />
              <MarkdownRender className={styles.article}>
                {processedMarkdown.processed}
              </MarkdownRender>
              <CommentSection
                articleName={article.name}
                ref={commentSectionRef}
                comments={comments}
                refetchComments={refetchComments}
              />
              <TagViews tags={article.tags} />
            </>
          );

        case PageViewType.Editting:
          return isAdmin && <Admin currentArticle={article} />;

        case PageViewType.Migration:
          return (
            <>
              <h1>Page Migration</h1>
              <Input
                label="Migration Title"
                changeHandler={(e) => updateMigrationTitleName(e.target.value)}
                defaultValue={migrationTitleName}
                value={migrationTitleName} />
              <Button onClick={async () => {
                if (migrationTitleName === name) {
                  alert("You cannot migrate a page unto itself!");
                } else {
                  const dispatchResult = await dispatch(migrateArticle({
                    name,
                    newName: migrationTitleName
                  }));
                  if (dispatchResult.payload) {
                    router.push(validPageLink(migrationTitleName));
                  }
                }
              }}>
                Migrate Page
              </Button>
            </>
          );
      }
    })()}
  </>;
}

export default ArticleComponent;

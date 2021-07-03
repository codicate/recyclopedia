import styles from "components/Article/Article.module.scss";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { migrateArticle, deleteArticle, restoreArticle, Article } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { validPageLink } from "utils/functions";
import { preprocessMarkdown } from "utils/preprocessMarkdown";

import MarkdownRender from "components/Article/MarkdownRender";
import Input from "components/Form/Input";
import Button from "components/UI/Button";

import Admin from "pages/Admin/Admin";
import MediaShareBtns from "./MediaShareBtns";
import TableOfContents from "./TableOfContents";
import TagViews from "./TagViews";


enum PageViewType {
  Reading,
  Editting,
  Migration,
}

interface ArticleProperties {
  inRecycling: boolean,
  article: Article,
}

function ArticleComponent({ article, inRecycling }: ArticleProperties) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType);
  const isAdmin = currentLoginType === LoginType.Admin;

  const { name, content, dateCreated, dateModified } = article;
  const [migrationTitleName, updateMigrationTitleName] = useState(name);

  const [lastViewType, updateLastViewType] = useState(PageViewType.Reading);
  const [viewType, updateViewType] = useState(PageViewType.Reading);

  const processedMarkdown = preprocessMarkdown(content);

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
            history.push(validPageLink(name));
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
            id={styles.deleteBtn}
            styledAs="oval"
            onClick={() => {
              if (confirm((inRecycling) ? "Permenantly delete this article?" : "Recycle this article?")) {
                dispatch(deleteArticle(name));
                history.push("/");
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
            <h1 className={styles.title}> {name} </h1>
            <div className="dateView">
              <p>Date Created: {format(dateCreated, "LLLL d, yyyy, h:mm a")}</p>
              {(dateModified) && (
                <p>Last Modified: {format(dateModified, "LLLL d, yyyy, h:mm a")}</p>
              )}
            </div>
            <MediaShareBtns title={name} />
            <TableOfContents sectionHeaders={processedMarkdown.headers} />
            <MarkdownRender className={styles.article}>
              {processedMarkdown.processed}
            </MarkdownRender>
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
              console.log(migrationTitleName, name);
              if (migrationTitleName === name) {
                alert("You cannot migrate a page unto itself!");
              } else {
                const dispatchResult = await dispatch(migrateArticle({
                  name,
                  newName: migrationTitleName
                }));
                if (dispatchResult.payload) {
                  history.push(validPageLink(migrationTitleName));
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

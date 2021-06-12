import styles from "components/Article/Article.module.scss";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { migrateArticle, deleteArticle, restoreArticle, Article } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { validPageLink } from "utils/functions";
import { preprocessMarkdown, HeaderInformation } from "utils/preprocessMarkdown";

import MarkdownRender from "components/Article/MarkdownRender";
import Collapsible from "components/UI/Collapsible";

import Input from "components/Form/Input";
import Button from "components/UI/Button";

import Admin from "pages/Admin/Admin";

function TableOfContents({ sectionHeaders }: { sectionHeaders: HeaderInformation[]; }) {
  return (sectionHeaders.length > 0) ? (
    <Collapsible header='Table of Contents' centered={true}>
      <nav style={{ marginLeft: "3em", }}>
        {
          sectionHeaders.map(({ level, text }) => (
            <a key={text} href={"#" + text}>
              <p style={{
                marginLeft: `${(level - 1) * 2}em`
              }}>
                        &bull; {text}
              </p>
            </a>
          ))
        }
      </nav>
    </Collapsible>
  ) : null;
}

function TagViews({ tags }: { tags?: string[]; }) {
  return (
    <div id={styles.tag_view}>
      {
        (tags) ? (
          <>
            <h5>This article was tagged with: </h5>
            {tags.map((tag) => <p key={tag}>{tag}</p>)}
          </>
        ) : (
          <h5>This article has not been tagged.</h5>
        )
      }
    </div>
  );
}

enum PageViewType {
    Reading,
    Editting,
    Migration,
}

interface ArticleProperties {
    inRecycling: boolean,
    article: Article,
}

function ArticleComponent({article, inRecycling}: ArticleProperties) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType);
  const isAdmin = currentLoginType === LoginType.Admin;

  const { name, content } = article;
  const [migrationTitleName, updateMigrationTitleName] = useState(name);

  const [lastViewType, updateLastViewType] = useState(PageViewType.Reading);
  const [viewType, updateViewType] = useState(PageViewType.Reading);

  const processedMarkdown = preprocessMarkdown(content);

  const standardAdminControls = (
    <>
      <Button
        styledAs="oval"
        onClick={() => {
          if (viewType !== PageViewType.Editting) {
            updateViewType(PageViewType.Editting);
            updateLastViewType(viewType);
          } else {
            updateViewType(lastViewType);
          }
        }}
      >
            Edit This Page
      </Button>
      <Button
        onClick={() => {
          if (viewType !== PageViewType.Migration) {
            updateViewType(PageViewType.Migration);
            updateLastViewType(viewType);
          } else {
            updateViewType(lastViewType);
          }
        }}
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

  return (
    <>
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
      {
        function() {
          switch (viewType) {
          case PageViewType.Reading:
            return (
              <>
                <h1 className={styles.title}> {name} </h1>
                <TableOfContents sectionHeaders={processedMarkdown.headers} />
                <MarkdownRender className={styles.article}>
                  {processedMarkdown.processed}
                </MarkdownRender>
                <TagViews tags={article.tags} />
              </>
            );
          case PageViewType.Editting:
            return isAdmin && <Admin currentArticle={article}/>;
          case PageViewType.Migration:
            return (
              <>
                <h1>Page Migration</h1>
                <Input
                  label="Migration Title"
                  changeHandler={(e) => updateMigrationTitleName(e.target.value)}
                  defaultValue={migrationTitleName}
                  value={migrationTitleName} />
                <Button
                  onClick={
                    async function () {
                      console.log(migrationTitleName, name);
                      if (migrationTitleName === name) {
                        alert("You cannot migrate a page unto itself!");
                      } else {
                        const dispatchResult = await dispatch(migrateArticle({name, newName: migrationTitleName}));
                        if (dispatchResult.payload) {
                          history.push(validPageLink(migrationTitleName));
                        }
                      }
                    }
                  }>Migrate Page</Button>
              </>
            );
          }
        }()
      }
    </>
  );
}

export default ArticleComponent;

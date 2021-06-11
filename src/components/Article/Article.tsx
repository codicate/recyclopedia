import styles from "components/Article/Article.module.scss";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { deleteArticle, Article } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { preprocessMarkdown } from "utils/preprocessMarkdown";

import MarkdownRender from "components/Article/MarkdownRender";
import Collapsible from "components/UI/Collapsible";
import Button from "components/UI/Button";
import Admin from "pages/Admin/Admin";

// @ts-ignore
function TableOfContents({ sectionHeaders }: { sectionHeaders: any[]; }) {
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

function ArticleComponent({
  article
}: {
  article: Article;
}) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType);
  const isAdmin = currentLoginType === LoginType.Admin;

  const { name, content } = article;
  const [adminEditView, updateAdminEditView] = useState(false);

  const processedMarkdown = preprocessMarkdown(content);
  return (
    <>
      {
        (isAdmin) && (
          <div id={styles.articleControls}>
            <Button
              styledAs="oval"
              onClick={() => updateAdminEditView(!adminEditView)}
            >
              Edit This Page
            </Button>

            <Button
              id={styles.deleteBtn}
              styledAs="oval"
              onClick={() => {
                if (confirm("Delete this article?")) {
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
      {(isAdmin && adminEditView) ? (
        <Admin
          currentArticle={article}
        />
      ) : (
        <>
          <h1 className={styles.title}> {name} </h1>
          <TableOfContents sectionHeaders={processedMarkdown.headers} />
          <MarkdownRender className={styles.article}>
            {processedMarkdown.processed}
          </MarkdownRender>
          <TagViews tags={article.tags} />
        </>
      )}
    </>
  );
}

export default ArticleComponent;

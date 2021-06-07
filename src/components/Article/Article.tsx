import styles from "components/Article/Article.module.scss";
import { useState } from "react";
import { useHistory } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { deleteArticle, Article } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { preprocessMarkdown } from "utils/preprocessMarkdown";

import MarkdownRender from "components/Article/MarkdownRender";
import Admin from "pages/Admin/Admin";

// It would be very useful to pull the Foldable part into a reusable component
// however, the styling cannot be preserved as I may want it to look different...
// someone may look into this later.

// https://www.npmjs.com/package/markdown-it-toc-done-right ?

// @ts-ignore
function TableOfContents({sectionHeaders} : {sectionHeaders: any[]}) {
  const [foldedStatus, updateFoldedStatus] = useState(false);

  return (sectionHeaders.length > 0) ?
    (<div id={styles.table_of_contents}>
      <h3 id={styles.header}>
            Table Of Contents 
        <a id={styles.folder}
          onClick={() => 
            updateFoldedStatus(!foldedStatus)}>
          {(foldedStatus) ? "+" : "-"}
        </a>
      </h3>
      {(!foldedStatus) ? 
        (<nav style={{ marginLeft: "3em", }}>
          {
            sectionHeaders.map(
              ({ level, text }) => {
                return (
                  <a key={text} href={"#" + text}>
                    <p style=
                      {
                        {
                          marginLeft: `${(level - 1) * 2}em`
                        }
                      }>&bull; {text}
                    </p>
                  </a>
                );
              }
            )
          }
        </nav>) :
        <></>}
    </div>
    ) : null;
}

function TagViews({ tags } : { tags?: string[] }) {
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
        isAdmin && (
          <>
            <button
              onClick={() => {
                dispatch(deleteArticle(name));
                history.push("/");
              }}
            >
                        Delete Page
            </button>
            <button
              onClick={() => updateAdminEditView(!adminEditView)}
            >
                        Edit This Page
            </button>
          </>
        )
      }
      {(
        isAdmin && adminEditView
      ) ? (
          <Admin
            currentArticle={article}
          />
        ) : (
          <>
            <h1 className={styles.title}> {name} </h1>
            <TableOfContents sectionHeaders={processedMarkdown.headers}/>
            <MarkdownRender className={styles.article}>
              {processedMarkdown.processed} 
            </MarkdownRender>
            <TagViews tags={article.tags}/>
          </>
        )}
    </>
  );
}

export default ArticleComponent;

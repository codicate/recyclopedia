import styles from 'components/Article/Article.module.scss';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from 'app/hooks';
import { deleteArticle, Article } from 'app/articlesSlice';
import { LoginType, selectLoginType } from 'app/adminSlice';

import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import MarkdownRender from "components/Article/MarkdownRender";
import Admin from 'pages/Admin/Admin';

// @ts-ignore
function TableOfContents({sectionHeaders} : {sectionHeaders: any[]}) {
  console.log(sectionHeaders);
  return (
    <div>
      <h3>Table Of Contents</h3>
      {
        sectionHeaders.map(
          ({ level, text }) => {
            return <p>{level}: {text}</p>
          }
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
                history.push('/');
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
        </>
      )}
    </>
  );
}

export default ArticleComponent;
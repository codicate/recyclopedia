import React, { useContext } from 'react';
import { Route, useHistory } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';
import { MarkdownRender } from "components/Article/RenderMarkdown";

import Admin from 'pages/Admin/Admin';

import { ApplicationContext } from 'App';
import { deleteArticle } from 'app/articlesSlice';
import { useAppDispatch } from 'app/hooks';

export function buildFromJSON({ article }) {
  return (
    <Route key={article.name} exact path={validPageLink(article.name)}>
      <Article article={article}/>
    </Route>
  );
}

export function ArticleRender({ name, content }) {
  return (
    <div>
      <h1 className={styles.title}> {name} </h1>
      <MarkdownRender className={styles.article}>
        {preprocessMarkdown(content)}
      </MarkdownRender>
    </div>
  );
}


export function Article({ article }) {
  const [adminEditView, updateAdminEditView] = React.useState(false);
  const history = useHistory();

  const context = useContext(ApplicationContext);
  const { name, content } = article;

  const dispatch = useAppDispatch();

  return <>
    {
      (context.isAdmin) && (
        <>
          <button
            onClick={() => {
              history.push("/");
              dispatch(deleteArticle(name));
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
    { (adminEditView)
      ? (<Admin currentArticle={article} />
      ) :
      <ArticleRender name={name} content={content} />
    }
  </>;
}

import styles from 'components/Article/Article.module.scss';
import { useState } from 'react';
import { Route, useHistory } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { selectIsAdmin } from 'app/adminSlice';

import { validPageLink } from 'utils/functions';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';
import { MarkdownRender } from "components/Article/RenderMarkdown";

import Admin from 'pages/Admin/Admin';


const md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);

export function buildFromJSON({ article, api, articlesData, setArticlesData }) {
  return (
    <Route key={article.name} exact path={validPageLink(article.name)}>
      <Article article={article} api={api} articlesData={articlesData} setArticlesData={setArticlesData} />
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

export function Article({ article, api, articlesData, setArticlesData }) {
  const history = useHistory();
  const isAdmin = useAppSelector(selectIsAdmin);

  const { name, content } = article;
  const [adminEditView, updateAdminEditView] = useState(false);

  return <>
    {
      (isAdmin) && (
        <>
          <button
            onClick={() => {
              api.deleteArticle(name);
              history.push('/');
              articlesData.articles = articlesData.articles.filter(item => item.name !== name);
              setArticlesData(articlesData);
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
      ? (<Admin
        currentArticle={article}
        api={api}
        articlesData={articlesData}
        setArticlesData={setArticlesData} />
      ) :
      <ArticleRender name={name} content={content} />
    }
  </>;
}

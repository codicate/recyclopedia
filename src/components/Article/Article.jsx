import React, { useContext } from 'react';
import { Route, useHistory } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import Admin from 'pages/Admin/Admin';

import { ApplicationContext } from 'App';

const md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);

export function buildFromJSON({ name, content, api, articlesData, setArticlesData }) {
  return (
    <Route key={name} exact path={validPageLink(name)}>
      <Article name={name} content={content} api={api} articlesData={articlesData} setArticlesData={setArticlesData} />
    </Route>
  );
}

function Article({ name, content, api, articlesData, setArticlesData }) {
  const [adminEditView, updateAdminEditView] = React.useState(false);
  const history = useHistory();

  const context = useContext(ApplicationContext);

  return <>
    {
      (context.isAdmin) && (
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
      ? (
        <Admin
          currentArticle={{ name, content }}
          api={api}
          articlesData={articlesData}
          setArticlesData={setArticlesData}
        />
      ) : (
        <div>
          <h1 className={styles.title}>
            {name}
          </h1>
          <div
            className={styles.article}
            dangerouslySetInnerHTML={{ __html: md.render(preprocessMarkdown(content)) }}>
          </div>
        </div>
      )
    }
  </>;
}

export default Article;

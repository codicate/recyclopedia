import React, { useContext } from 'react';
import { Route, useHistory } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';
import { MarkdownRender } from "components/Article/RenderMarkdown";

import Admin from 'pages/Admin/Admin';

import { ApplicationContext } from 'App';

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
    const [adminEditView, updateAdminEditView] = React.useState(false);
    const history = useHistory();

    const context = useContext(ApplicationContext);
    const {name, content} = article;

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

import React from 'react';
import { Route } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

const md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);

export function buildFromJSON({ name, content, id }) {
  return (
    <Route key={name} exact path={validPageLink(name)}>
      <Article name={name} content={content} />
    </Route>
  );
}

function Article({ name, content }) {
    content = preprocessMarkdown(content);

    return (
        <div>
          <h1 className={styles.title}>{name}</h1>
          <div className={styles.article} dangerouslySetInnerHTML={{ __html: md.render(content) }}>
          </div>
          <br></br>
        </div>
    );
}

export default Article;

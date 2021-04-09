import React from 'react';
import { Route } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';

export function buildFromJSON({ name, content, id }) {
  return (
    <Route key={name} exact path={validPageLink(name)}>
      <Article name={name} content={content} />
    </Route>
  );
}

function Article({ name, content }) {
  return (
    <div>
      <h1>{name}</h1>
      <p>{content}</p>
      <br></br>
    </div>
  );
}

export default Article;
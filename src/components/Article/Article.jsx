import React from 'react';
import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';

import { Route, Link } from 'react-router-dom';


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
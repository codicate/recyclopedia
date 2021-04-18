import { useState } from 'react';
import { Route, Switch, Link } from 'react-router-dom';

import styles from 'App.module.scss';
import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage/Homepage";
import Admin from "pages/Admin/Admin";

function App() {
  const [articlesData, setArticlesData] = useState(globalArticlesData);

  return (
    <>
      <header id={styles.header}>
        <nav id={styles.navbar}>
          <Link to="/">
            <div id={styles.logoDiv}></div>
          </Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>

      <main id={styles.main}>
        <article id={styles.page}>
          <Switch>
            <Route exact path='/'>
              <Homepage articlesData={articlesData} />
            </Route>
            <Route exact path='/admin'>
              <Admin articlesData={articlesData} setArticlesData={setArticlesData} />
            </Route>
            {articlesData.articles.map(buildFromJSON)}
          </Switch>
        </article>
      </main>

      <footer id={styles.footer}>

      </footer>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Route, Switch, Link, useHistory } from 'react-router-dom';

import styles from 'App.module.scss';
import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage/Homepage";
import Admin from "pages/Admin/Admin";

import {Secrets} from 'secrets';

function App({ api }) {
  const [articlesData, setArticlesData] = useState(globalArticlesData);
  const history = useHistory();

  useEffect(function () {
    (async function () { setArticlesData(await api.queryForArticles()); })();
  }, []);

  return (
    <>
      <header id={styles.header}>
        <nav id={styles.navbar}>
          <Link to="/">
            <div id={styles.logoDiv}></div>
          </Link>
          <button
            onClick={
              function () {
                if (prompt("Enter Admin Password") === Secrets.ADMIN_PASSWORD) {
                  history.push('/admin');
                }
              }
            }
          >
            Admin
          </button>
        </nav>
      </header>

      <main id={styles.main}>
        <article id={styles.page}>
          <Switch>
            <Route exact path='/'>
              <Homepage articlesData={articlesData}/>
            </Route>
            <Route exact path='/admin'>
              <Admin api={api} articlesData={articlesData} setArticlesData={setArticlesData} />
            </Route>
            {articlesData.articles.map(({name, content}) => buildFromJSON({name, content, api, articlesData, setArticlesData}))}
            <Route>
              404
            </Route>
          </Switch>
        </article>
      </main>

      <footer id={styles.footer}>

      </footer>
    </>
  );
}

export default App;

import { useEffect, useState, useContext, createContext } from 'react';
import { Route, Switch, Link, useHistory } from 'react-router-dom';

import styles from 'App.module.scss';
import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage/Homepage";
import Admin from "pages/Admin/Admin";

import { Secrets } from 'secrets';

export const ApplicationContext = createContext({});

function App({ api }) {
  const [articlesData, setArticlesData] = useState(globalArticlesData);
  const history = useHistory();

  useEffect(function () {
    (async function () { setArticlesData(await api.queryForArticles()); })();
  }, []);

  const [isAdmin, _setAdminState] = useState(localStorage.getItem('isAdmin') || false);
  function setAdminState(value) {
    localStorage.setItem('isAdmin', value);
    _setAdminState(value);
  }
  return (
    <ApplicationContext.Provider value={
      {
          isAdmin: isAdmin,
          setAdminState: setAdminState,
      }
    }>

      <header id={styles.header}>
        <nav id={styles.navbar}>
          <Link to="/">
            <div id={styles.logoDiv}></div>
          </Link>
          <button
            onClick={
              function () {
                if (prompt("Enter Admin Password") === Secrets.ADMIN_PASSWORD) {
                  setAdminState(true);
                }
              }
            }
          >
            Admin
          </button>
          {(isAdmin) && <Link to="/admin">Create New Article</Link>}
        </nav>
      </header>

      <main id={styles.main}>
        <article id={styles.page}>
          <Switch>
            <Route exact path='/'>
              <Homepage articlesData={articlesData} />
            </Route>
            <Route exact path='/admin'>
              <Admin api={api} articlesData={articlesData} setArticlesData={setArticlesData} />
            </Route>
            {articlesData.articles.map(({ name, content }) => buildFromJSON({ name, content, api, articlesData, setArticlesData }))}
            <Route>
              404
            </Route>
          </Switch>
        </article>
      </main>

      <footer id={styles.footer}>

      </footer>
      
    </ApplicationContext.Provider >
  );
}

export default App;

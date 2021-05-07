import styles from 'App.module.scss';
import { useEffect, useState, createContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import useLocalStorageState from 'hooks/useLocalStorageState';

import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";

import Header from 'pages/Header/Header';
import Homepage from "pages/Homepage/Homepage";
import Admin from "pages/Admin/Admin";


export const ApplicationContext = createContext({});

function App({ api }) {
  const [articlesData, setArticlesData] = useState(globalArticlesData);
  useEffect(() => {
    (async () => setArticlesData(await api.queryForArticles()))();
  }, [api]);

  const [isAdmin, setIsAdmin] = useLocalStorageState('isAdmin', false);

  return (
    <ApplicationContext.Provider value={{
      isAdmin: isAdmin,
      setAdminState: setIsAdmin,
    }}>

      <Header />

      <main id={styles.main}>
        <Switch>
          <Route exact path='/'>
            <Homepage articlesData={articlesData} />
          </Route>
          <Route exact path='/admin'>
            <Admin
              api={api}
              articlesData={articlesData}
              setArticlesData={setArticlesData}
            />
          </Route>

          {
            articlesData.articles.map(({ name, content }) =>
              buildFromJSON({ name, content, api, articlesData, setArticlesData })
            )
          }

          <Route path='*'>
            404
          </Route>
        </Switch>
      </main>

      <footer id={styles.footer}>

      </footer>
      
    </ApplicationContext.Provider >
  );
}

export default App;

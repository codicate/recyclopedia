import styles from 'App.module.scss';
import { useEffect, useState, createContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import useLocalStorageState from 'hooks/useLocalStorageState';

import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";

import Header from 'pages/Header/Header';
import Homepage from "pages/Homepage/Homepage";
import IndexPage from "pages/Index/IndexPage";
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

      <Header articlesData={articlesData}/>

      <main id={styles.main}>
        <Switch>
          <Route exact path='/index'>
            <IndexPage articlesData={articlesData} />
          </Route>
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
            (isAdmin) ?
              (articlesData.articles
                .map((article) =>
                  buildFromJSON({ article: { ...article }, api, articlesData, setArticlesData })))
              :
              (articlesData.articles
                .filter((article) => article.draftStatus === false || article.draftStatus === undefined)
                .map((article) =>
                  buildFromJSON({ article: { ...article }, api, articlesData, setArticlesData })))
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

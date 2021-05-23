import styles from 'App.module.scss';
import { useEffect, createContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import useLocalStorageState from 'hooks/useLocalStorageState';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { initApi, selectStatus, selectArticlesData } from 'app/articlesSlice';

import { Secrets } from 'secrets';
import { buildFromJSON } from "components/Article/Article";

import Header from 'pages/Header/Header';
import Homepage from "pages/Homepage/Homepage";
import IndexPage from "pages/Index/IndexPage";
import Admin from "pages/Admin/Admin";


export const ApplicationContext = createContext({});

function App() {
  const articlesData = useAppSelector(selectArticlesData);
  const [isAdmin, setIsAdmin] = useLocalStorageState('isAdmin', false);

  return (
    <ApplicationContext.Provider value={{
      isAdmin: isAdmin,
      setAdminState: setIsAdmin,
    }}>

      <Header />

      <main id={styles.main}>
        <p>Please wait! Loading Recyclopedia...</p>
        <Switch>
          <Route exact path='/index'>
            <IndexPage articlesData={articlesData} />
          </Route>
          <Route exact path='/'>
            <Homepage />
          </Route>
          <Route exact path='/admin'>
            <Admin />
          </Route>

          {
            (isAdmin)
              ? articlesData.articles.map((article) =>
                buildFromJSON({ article: { ...article } })
              )
              : articlesData.articles.filter((article) =>
                article.draftStatus === false || article.draftStatus === undefined
              ).map((article) =>
                buildFromJSON({ article: { ...article } })
              )
          }

          <Route path='*'>
            404
          </Route>
        </Switch>
      </main>
    </ApplicationContext.Provider >
  );
}

function InitializingApp() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initApi(Secrets.RECYCLOPEDIA_APPLICATION_ID));
  }, [dispatch]);

  const status = useAppSelector(selectStatus);

  if (status === 'failed')
    return <p>MongoDB is probably offline. Crap.</p>;

  if (status === 'succeed')
    return <App />;

  return <p>Please wait! Loading Recyclopedia...</p>;
}

export default InitializingApp;

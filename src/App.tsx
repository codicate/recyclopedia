import styles from 'App.module.scss';
import { useEffect, createContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { initApi, selectStatus, selectArticlesData } from 'app/articlesSlice';
import { selectIsAdmin, setIsAdmin } from 'app/adminSlice';

import { Secrets } from 'secrets';
import Article from "components/Article/Article";

import Header from 'pages/Header/Header';
import Homepage from "pages/Homepage/Homepage";
import IndexPage from "pages/Index/IndexPage";
import Admin from "pages/Admin/Admin";
import { validPageLink } from 'utils/functions';

import { loginWith } from 'app/articlesSlice';

export const ApplicationContext = createContext({});

function RegisterPage(_: {}) {
  return (
    <>
      <h1>Register a New Account (TODO)</h1>
      <p>asdf</p>
    </>
  );
}

function LoginPage(_: {}) {
  // someone do this later
  const dispatch = useAppDispatch();
  useEffect(
    function () {
      const userName = prompt("Enter Username");
      const password = prompt("Enter Password");

      (async function () {
        if (userName && password) {
          try {
            const loginResult = await loginWith({ email: userName, password });
            if (loginResult) {
              dispatch(setIsAdmin(loginResult.customData.status === "admin"));
            }
          } catch (error) {
            console.log(error);
            alert("Unrecognized user credentials.");
          }
        }
      })();
    },
  []);

  return (
    <>
      <h1>Login With Your Account!</h1>
      <Redirect to="/"></Redirect>
    </>
  );
}

function App() {
  const articlesData = useAppSelector(selectArticlesData);
  const isAdmin = useAppSelector(selectIsAdmin);

  return (
    <>
      <Header />

      <main id={styles.main}>
        <Switch>
          <Route exact path='/index'>
            <IndexPage />
          </Route>
          <Route exact path='/'>
            <Homepage articlesData={articlesData}/>
          </Route>
          <Route exact path='/admin'>
            {
              isAdmin
                ? <Admin currentArticle={undefined} />
                : <Redirect to='/' />
            }
          </Route>

          {((isAdmin) ? 
            articlesData.articles :
            articlesData.articles.filter((article) => !article.draftStatus))
            .map((article) =>
              <Route key={article.name} exact path={validPageLink(article.name)}>
                <Article article={article} />
              </Route>
            )}
          <Route path="/login">
            <LoginPage></LoginPage>
          </Route>
          <Route path="/register">
            <RegisterPage></RegisterPage>
          </Route>
          <Route path='*'>404</Route>
        </Switch>
      </main>
    </>
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

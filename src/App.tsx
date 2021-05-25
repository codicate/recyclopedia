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
              console.log(loginResult.customData);
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

{
          /*
            For obvious reasons getting ALL the articles is kind of dumb. I believe it
            would be better if we fetched articles on the 404 path.

            Basically we don't generate the routes here. Rather we kind of hook them up on demand.

            So the index is still generated with links, and only as much as we need to display a page.

            Basically that means I have to do something like:

            bucketSize  = the amount of things we consider to be on a "page"
            bucketIndex = the "page"
            getArticleInformationPageful(bucketSize: number, bucketIndex: number);

            IE:
            It's like:
              getAllArticles().slice(bucketIndex * bucketSize, (bucketIndex+1) * bucketSize);
              but since it's on the server side, it reduces the load to send all of them.

           Then in the wildcard route we simply try to make the article component request the article
           in the URL. If it can't do it, then we just display normal 404.

           We only have 1 million free api requests from MongoDB so this might ironically be worse since
           each article will take a request from the API (even though it uses less storage space on the
           client side).
          */
}
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

/*
  I said in store.ts that we should basically have another line of code
  around here.
*/
function InitializingApp() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initApi(Secrets.RECYCLOPEDIA_APPLICATION_ID));

    /*
    Something like this.

    const {userName, password} = useAppSelector(SavedLoggedInCredentials);
    loginWith(userName, password);
    */
  }, [dispatch]);

  const status = useAppSelector(selectStatus);

  if (status === 'failed')
    return <p>MongoDB is probably offline. Crap.</p>;

  if (status === 'succeed')
    return <App />;

  return <p>Please wait! Loading Recyclopedia...</p>;
}

export default InitializingApp;

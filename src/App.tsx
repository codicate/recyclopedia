import styles from "App.module.scss";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { initApi, selectStatus, selectArticlesData } from "app/articlesSlice";
import { selectLoginType, LoginType } from "app/adminSlice";

import { Secrets } from "secrets";
import { validPageLink } from "utils/functions";

import Spinner from "components/UI/Spinner";

import Header from "pages/Header/Header";
import Homepage from "pages/Homepage/Homepage";

const Article = lazy(() => import("components/Article/Article"));
const IndexPage = lazy(() => import("pages/Index/IndexPage"));
const RecyclingBin = lazy(() => import("pages/RecyclingBin/RecyclingBin"));
const Admin = lazy(() => import("pages/Admin/Admin"));
const Register = lazy(() => import("pages/Admin/Register"));
const Login = lazy(() => import("pages/Admin/Login"));

function App() {
  const articlesData = useAppSelector(selectArticlesData);
  const currentLoginType = useAppSelector(selectLoginType);

  return (
    <>
      <Header />

      <main id={styles.main}>
        <Switch>
          <Route exact path='/'>
            <Homepage articlesData={articlesData} />
          </Route>

          <Suspense fallback={
            <p>Please wait! Loading Recyclopedia...</p>
          }>
            <Route exact path='/index'>
              <IndexPage />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/register">
              <Register />
            </Route>

            <Route exact path='/admin'>
              {
                (currentLoginType === LoginType.Admin)
                  ? <Admin currentArticle={undefined} />
                  : <Redirect to='/' />
              }
            </Route>
            <Route exact path='/admin/recycling_bin/'>
              <RecyclingBin />
            </Route>

            {
              (currentLoginType === LoginType.Admin)
                ? articlesData.articles.map((article) =>
                  <Route key={article.name} exact path={"/admin/recycling_bin/"+validPageLink(article.name)}>
                    <Article inRecycling={true} article={article} />
                  </Route>)
                : <Redirect to='/' />
            }

            {((currentLoginType === LoginType.Admin)
              ? articlesData.articles
              : articlesData.articles.filter((article) => !article.draftStatus)
            ).map((article) =>
              <Route key={article.name} exact path={validPageLink(article.name)}>
                <Article inRecycling={false} article={article} />
              </Route>
            )}
          </Suspense>

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

  if (status === "failed")
    return (
      <div id={styles.errorScreen} >
        <div className={styles.errorImg} />
        <p>MongoDB is probably offline. Crap...</p>
      </div>
    );

  if (status === "succeed")
    return <App />;

  return (
    <div id={styles.loadingScreen} >
      <Spinner color="black" />
      <p>Please wait! Loading Recyclopedia...</p>
    </div>
  );
}

export default InitializingApp;


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

import styles from "./index.module.scss";
import { useEffect } from "react";
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from "lib/state/hooks";
import {
  initApi,
  selectStatus,
  readArticlesFromLoginType,
  selectNameOfFeaturedArticle,
  ArticlesDataProperties
} from "lib/state/articles";
import { selectLoginType, LoginType } from "lib/state/admin";
import { ArticleModel } from 'lib/models';
import { validPageLink, randomElt } from "lib/functions";
import Secrets from 'secrets';

import Spinner from "components/UI/Spinner";
import Banner from "components/Article/Banner";
import MarkdownRender from "components/Article/MarkdownRender";


interface ArticlePreviewProperties {
  previewTitle: string,
  article: ArticleModel | undefined | null,
}

function ArticlePreview({ previewTitle, article }: ArticlePreviewProperties) {
  if (article) {
    return (
      <>
        <Link href={validPageLink(article.name)}>
          <a><h2>{previewTitle}</h2></a>
        </Link>

        <div className={styles.articleDisplay}>
          <h2>{article.name}</h2>
          {(article?.bannerImage) && (
            <Banner bannerImage={article.bannerImage}></Banner>
          )}
          <MarkdownRender className={styles.searchResult}>
            {`${article.content.substr(0, 800).replaceAll(/(@@.*)|(@@.*@@)/g, "")}`}
          </MarkdownRender>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}

function ArticleShowcase({
  articlesData: { articles }
}: ArticlesDataProperties
) {
  const randomArticle = (articles.length)
    ? randomElt(articles)
    : { name: "no article name", content: "no articles" };

  const featuredArticleName = useAppSelector(selectNameOfFeaturedArticle);
  const featuredArticle = articles.find((element) => element.name === featuredArticleName);

  return (
    <>
      <ArticlePreview previewTitle="Featured Article" article={featuredArticle} />
      <ArticlePreview previewTitle="Random Article" article={randomArticle} />
    </>
  );
}

function Home() {
  const currentLoginType = useAppSelector(selectLoginType);
  const articlesData = readArticlesFromLoginType();

  return (
    <>
      <div id={styles.homepage}>
        <h1>Welcome to Recyclopedia</h1>
        <p>
          Recyclopedia is a freely accessible wiki designed to be a complete source for
          environmentally friendly actions. While it is primarily meant to be a comprehensive
          source of ways to recycle items appropriately. It may also contain other methods of
          sustaining an environmentally friendly lifestyle.
        </p>
        <p>
          This is developed by <a href="https://www.projectenv.org/">The Environment Project</a>
        </p>
        <ArticleShowcase articlesData={articlesData} />
      </div>
    </>
  );
}

const initializeApp = (
  App: () => JSX.Element
) => () => {
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
};

export default initializeApp(Home);


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
  getArticles().slice(bucketIndex * bucketSize, (bucketIndex+1) * bucketSize);
  but since it's on the server side, it reduces the load to send all of them.

  Then in the wildcard route we simply try to make the article component request the article
  in the URL. If it can't do it, then we just display normal 404.

  We only have 1 million free api requests from MongoDB so this might ironically be worse since
  each article will take a request from the API (even though it uses less storage space on the
  client side).
*/
import styles from "pages/Homepage/Homepage.module.scss";
import { Link } from "react-router-dom";

import { validPageLink, randomElt } from "utils/functions";
import MarkdownRender from "components/Article/MarkdownRender";


import { ArticlesDataProperties, selectNameOfFeaturedArticle, Article } from "app/articlesSlice";
import { useAppSelector } from "app/hooks";

interface ArticlePreviewProperties {
  previewTitle: string,
  article: Article | undefined | null,
}
function ArticlePreview({previewTitle, article}: ArticlePreviewProperties) {
  if (article) {
    return (
      <>
        <Link to={validPageLink(article.name)}>
          <h2>{previewTitle}</h2>
        </Link>

        <div className={styles.articleDisplay}>
          <h2>{article.name}</h2>
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
      <ArticlePreview previewTitle="Featured Article" article={featuredArticle}/>
      <ArticlePreview previewTitle="Random Article" article={randomArticle}/>
    </>
  );
}

function Homepage({ articlesData }: ArticlesDataProperties) {
  return (
    <div id={styles.homepage}>
      <h1>Welcome to Recyclopedia</h1>
      <p>
        Recyclopedia is a freely accessible wiki designed to be a complete source for
        environmentally friendly actions. While it is primarily meant to be a comprehensive
        source of ways to recycle items appropriately. It may also contain other methods of
        sustaining an environmentally friendly lifestyle.
      </p>
      <p>This is developed by <a href="https://www.projectenv.org/">The Environment Project</a></p>
      <ArticleShowcase articlesData={articlesData} />
    </div>
  );
}

export default Homepage;
import styles from "pages/Homepage/Homepage.module.scss";
import { Link } from "react-router-dom";

import { validPageLink, randomElt } from "utils/functions";
import MarkdownRender from "components/Article/MarkdownRender";


import { ArticlesDataProperties, selectNameOfFeaturedArticle } from "app/articlesSlice";
import { useAppSelector } from "app/hooks";

function ArticleShowcase({
  articlesData: { articles }
}: ArticlesDataProperties
) {
  const { name, content } = (articles.length)
    ? randomElt(articles)
    : { name: "no article name", content: "no articles" };

  const featuredArticleName = useAppSelector(selectNameOfFeaturedArticle);
  const featuredArticle = articles.find((element) => element.name === featuredArticleName);

  return (
    <>
      {
        (featuredArticle) ?
          <>
            <h2>Featured Article</h2>

            <div className={styles.articleDisplay}>
              <h2>{featuredArticle.name}</h2>
              <MarkdownRender className={styles.searchResult}>
                {`${featuredArticle.content.substr(0, 800).replaceAll(/(@@.*)|(@@.*@@)/g, "")}`}
              </MarkdownRender>
            </div>
          </>
          : <> </>
      }

      <div className={styles.articleDisplay}>
        <Link to={validPageLink(name)}>
          <h2>Random Article</h2>
        </Link>
        <div>
          <h2>{name}</h2>
          <MarkdownRender className={styles.searchResult}>
            {`${content.substr(0, 800).replaceAll(/(@@.*)|(@@.*@@)/g, "")}`}
          </MarkdownRender>
        </div>
      </div>
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
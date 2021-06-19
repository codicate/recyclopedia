import styles from "pages/Homepage/Homepage.module.scss";
import { Link } from "react-router-dom";

import { validPageLink, randomElt } from "utils/functions";
import MarkdownRender from "components/Article/MarkdownRender";


import { ArticlesDataProperties } from "app/articlesSlice";

function ArticleShowcase({
  articlesData: { articles }
}: ArticlesDataProperties
) {
  const { name, content } = (articles.length)
    ? randomElt(articles)
    : { name: "no article name", content: "no articles" };

  return (
    <>
      <div className={styles.articleDisplay}>
        <h2>Featured Article</h2>
        <div>
          <p>TODO what is the best way to determine a featured article?</p>
          <p>Honestly, that might have to be manually audited since that depends on a lot of things.</p>
        </div>
      </div>

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
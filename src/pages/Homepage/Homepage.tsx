import styles from 'pages/Homepage/Homepage.module.scss';
import { randomElt } from 'utils/functions';
import MarkdownRender from 'components/Article/MarkdownRender';

import { ArticlesDataProperties } from 'app/articlesSlice';

function ArticleShowcase({ articlesData: { articles } }: ArticlesDataProperties) {
  const { name, content } = (articles.length) ? randomElt(articles) : { name: "no article name", content: "no articles" };
  return (
    <>
      <h2>Featured Article</h2>
      <div className={styles.articleDisplay}>
        <p>TODO what is the best way to determine a featured article?</p>
        <p>Honestly, that might have to be manually audited since that depends on a lot of things.</p>
      </div>
      <h2>Random Article</h2>
      <div className={styles.articleDisplay}>
        <h2>{name}</h2>
        <MarkdownRender className={styles.searchResult}>
          {`${content.substr(0, 800).replaceAll(/(@@.*)|(@@.*@@)/g, '')}`}
        </MarkdownRender>
      </div>
    </>
  );
}

function Homepage({ articlesData }: ArticlesDataProperties) {
  console.log(articlesData);
  return (
    <>
      <h1>Welcome to Recyclopedia</h1>
      <p>
        Recyclopedia is a freely accessible wiki designed to be a complete source for
        environmentally friendly actions. While it is primarily meant to be a comprehensive
        source of ways to recycle items appropriately. It may also contain other methods of
        sustaining an environmentally friendly lifestyle.
      </p>
      <br></br>
      <p>This is developed by the <a href="https://www.projectenv.org/"><u>Environment Project</u></a></p>
      <br></br>
      <ArticleShowcase articlesData={articlesData}></ArticleShowcase>
    </>
  );
}

export default Homepage;
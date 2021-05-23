import styles from 'pages/Admin/TagEditor';
import Form from 'components/Form/Form';

function anyInside(array, items) {
  for (let item = 0; item < items.length; item++) {
    if (array.includes(items[item])) {
      return true;
    }
  }

  return false;
}

function findTag(articles, tags) {
  return articles.filter(function (article) { return anyInside(article.tags, tags); });
}

export function TagEditor({ currentArticle }) {
  return <>
    <ul>
      {console.log(currentArticle)}
      {currentArticle.tags?.map((tag) => <li>{tag}</li>)}
    </ul>
  </>;
}
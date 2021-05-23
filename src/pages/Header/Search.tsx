import styles from 'pages/Header/Search.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { selectArticlesData, Article } from 'app/articlesSlice';

import { validPageLink } from 'utils/functions';
import MarkdownRender from 'components/Article/MarkdownRender';

import Searchbar from 'components/Searchbar/Searchbar';

export function renderAsParagraphs(searchResults: Article[]) {
  return searchResults.map(({ name }) =>
    <p>{name}</p>
  );
}

export function renderSearchLink(searchResults: Article[]) {
  return searchResults.map(({ name, content }) => (
    <Link to={validPageLink(name)}>
      <u><p>{name}</p></u>
      <MarkdownRender className={styles.searchResult}>
        {`${content.substr(0, 320).replaceAll(/(@@.*)|(@@.*@@)/g, '')}...`}
      </MarkdownRender>
    </Link>
  ));
}

export function renderHoverboxSearch(searchResults: Article[]) {
  return (searchResults.length > 0) ? (
    <div className={styles.hoverBox}>
      {
        searchResults.slice(0, 5).map(({ name, content }) => (
          <Link to={validPageLink(name)}>
            <u><p>{name}</p></u>
          </Link>))
      }
    </div>
  ) :
    <></>;
}

function Search({
  searchFunction, renderFunction
}: {
  searchFunction: (articles: Article[], input: string) => Article[];
  renderFunction: (article: Article[]) => JSX.Element | null;
}) {
  const articlesData = useAppSelector(selectArticlesData);
  const [searchResult, setSearchResult] = useState<Article[]>([]);

  function returnInputCallback(input: string) {
    setSearchResult(
      input ? searchFunction(
        articlesData.articles.map((article) => article),
        input
      ) : []
    );
  }

  return (
    <div className={styles.searchbar}>
      <Searchbar
        returnInput={returnInputCallback}
      />
      { renderFunction(searchResult)}
    </div>
  );
}

export default Search;

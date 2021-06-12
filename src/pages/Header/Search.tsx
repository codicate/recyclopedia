import styles from "pages/Header/Search.module.scss";
import searchbarStyle from "components/Searchbar/Searchbar.module.scss";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import { useAppSelector } from "app/hooks";
import { selectArticlesData, Article } from "app/articlesSlice";

import { validPageLink } from "utils/functions";
import MarkdownRender from "components/Article/MarkdownRender";

import Searchbar from "components/Searchbar/Searchbar";

export function renderAsParagraphs(searchResults: Article[]) {
  return searchResults.map(({ name }) =>
    <p key={name}>{name}</p>
  );
}

export function renderSearchLink(searchResults: Article[]) {
  return searchResults.map(({ name, content }) => (
    <Link
      key={name}
      to={validPageLink(name)}
    >
      <p>{name}</p>
      <MarkdownRender className={styles.searchResult}>
        {`${content.substr(0, 320).replaceAll(/(@@.*)|(@@.*@@)/g, "")}...`}
      </MarkdownRender>
    </Link>
  ));
}

export function renderHoverboxSearch(
  searchResults: Article[],
) {

  return (searchResults.length > 0) ? (
    <div className={searchbarStyle.searchResults}>
      {
        searchResults.slice(0, 5).map(({ name }) => (
          <Link
            key={name}
            to={validPageLink(name)}
            onClick={() => console.log("hell")}
          >
            {name}
          </Link>))
      }
    </div>
  ) : null;
}

function Search({
  searchFunction, renderFunction
}: {
  searchFunction: (articles: Article[], input: string) => Article[];
  renderFunction: (
    article: Article[],
  ) => JSX.Element | null;
}) {
  const articlesData = useAppSelector(selectArticlesData);
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  function returnInputCallback(input: string) {
    setSearchResults(
      input ? searchFunction(
        articlesData.articles.map((article) => article),
        input
      ) : []
    );
  }

  const searchbarContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.searchbar}
      ref={searchbarContainerRef}
      onBlur={() => {
        // This is necessary because, afaik, react and javascript doesn't have a way to check focus-within is lost or not, something like onBlurWithin : (
        // ISSUE: when you click on a link, the search results box does not auto close
        if (!searchbarContainerRef.current?.matches(":focus-within")) {
          setSearchResults([]);
        }
      }}
    >
      <Searchbar
        isSearchResultsOpened={(searchResults.length !== 0)}
        returnInput={returnInputCallback}
      />
      {renderFunction(searchResults)}
    </div>
  );
}

export default Search;

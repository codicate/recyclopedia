import styles from "pages/Header/Search.module.scss";
import searchbarStyle from "components/Searchbar/Searchbar.module.scss";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import { useAppSelector } from "app/hooks";
import { selectArticlesData, Article } from "app/articlesSlice";

import { validPageLink } from "utils/functions";
import MarkdownRender from "components/Article/MarkdownRender";

import Searchbar from "components/Searchbar/Searchbar";

type SearchFunction = 
  (inputArticles: Article[], input: string) => Article[];
type RenderSearchResultFunction =
  (searchResults: Article[], updateSearchResults: (x: typeof searchResults) => void) => JSX.Element | null;

export function renderHoverboxSearch(searchResults: Article[], updateSearchResults: (x: typeof searchResults) => void) {
  return (searchResults.length > 0) ? (
    <div className={searchbarStyle.searchResults}>
      {
        searchResults.slice(0, 5).map(({ name }) => (
          <Link
            key={name}
            to={validPageLink(name)}
            onClick={() => updateSearchResults([])}
          >
            {name}
          </Link>))
      }
    </div>
  ) : null;
}

interface SearchProperties {
  searchFunction: SearchFunction,
  renderFunction: RenderSearchResultFunction,
}

function Search({searchFunction, renderFunction}: SearchProperties) {
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
      {renderFunction(searchResults, setSearchResults)}
    </div>
  );
}

export default Search;

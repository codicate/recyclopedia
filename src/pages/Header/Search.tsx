import styles from "components/Searchbar/Searchbar.module.scss";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import { Article, readArticlesFromLoginType } from "app/articlesSlice";
import { validPageLink } from "utils/functions";
import Searchbar from "components/Searchbar/Searchbar";


type SearchFunction =
  (inputArticles: Article[], input: string) => Article[];
type RenderSearchResultFunction =
  (searchResults: Article[], updateSearchResults: (x: typeof searchResults) => void) => JSX.Element | null;

export function renderHoverboxSearch(searchResults: Article[], updateSearchResults: (x: typeof searchResults) => void) {
  return (searchResults.length > 0) ? (
    <div className={styles.searchResults}>
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

function Search({ searchFunction, renderFunction }: SearchProperties) {
  const articlesData = readArticlesFromLoginType();
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  function returnInputCallback(input: string) {
    setSearchResults(
      input ?
        searchFunction(articlesData.articles, input) :
        []
    );
  }

  const searchbarContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={searchbarContainerRef}
      onBlur={() => {
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

import styles from "components/Searchbar/Searchbar.module.scss";
import { useState, useRef } from "react";
import Link from 'next/Link';

import { ArticleModel, readArticlesFromLoginType } from "app/articlesSlice";
import { validPageLink } from "utils/functions";
import Searchbar from "components/Searchbar/Searchbar";


type SearchFunction = (
  inputArticles: ArticleModel[],
  input: string
) => ArticleModel[];

type RenderSearchResultFunction = (
  searchResults: ArticleModel[],
  updateSearchResults: (x: typeof searchResults) => void
) => JSX.Element | null;

export function renderHoverboxSearch(searchResults: ArticleModel[], updateSearchResults: (x: typeof searchResults) => void) {
  return (searchResults.length > 0) ? (
    <div className={styles.searchResults}>
      {
        searchResults.slice(0, 5).map(({ name }) => (
          <Link
            key={name}
            href={validPageLink(name)}
          >
            <a onClick={() =>
              updateSearchResults([])
            } >
              {name}
            </a>
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
  const [searchResults, setSearchResults] = useState<ArticleModel[]>([]);

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

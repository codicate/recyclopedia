import { Link } from 'react-router-dom';

import { validPageLink } from 'utils/functions';
import styles from 'pages/Homepage/Homepage.module.scss';
import Searchbar from 'components/Searchbar/Searchbar';
import approximateSearch from 'utils/search';
import { useState } from 'react';

function Homepage({ api, setArticlesData, articlesData }) {
  const [searchResult, setSearchResult] = useState([]);

  const search = (input) => {
    setSearchResult(
      approximateSearch(
        articlesData.articles.map(({ name }) => name),
        input
      )
    );
  };

  return (
    <>
      <h1>Welcome to Recyclopedia</h1>
      <Searchbar returnInput={search} />
      {
        searchResult.map((articleTitle) => (
          <Link to={validPageLink(articleTitle)}>
            <u><p>{articleTitle}</p></u>
          </Link>
        ))
      }
      <br />
      {
        articlesData.articles.map(({ name }) => (
          <p key={name} >
            <Link to={validPageLink(name)}>
              {name}
            </Link>
          </p>
        ))
      }
    </>
  );
}

export default Homepage;
import styles from 'pages/Homepage/Homepage.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { selectArticlesData } from 'app/articlesSlice';

import { validPageLink } from 'utils/functions';
import approximateSearch from 'utils/search';

import Searchbar from 'components/Searchbar/Searchbar';


function Homepage() {
  const [searchResult, setSearchResult] = useState([]);
  const articlesData = useAppSelector(selectArticlesData);

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
          <Link key={articleTitle} to={validPageLink(articleTitle)}>
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
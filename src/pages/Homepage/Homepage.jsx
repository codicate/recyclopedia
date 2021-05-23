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

  return (
    <>
      <h1>Welcome to Recyclopedia</h1>
    </>
  );
}

export default Homepage;
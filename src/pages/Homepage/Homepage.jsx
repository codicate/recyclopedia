import { Link } from 'react-router-dom';

import styles from 'pages/Homepage/Homepage.module.scss';



import { useState, useContext } from 'react';
import { ApplicationContext } from 'App';

function Homepage({ api, setArticlesData }) {
  const context = useContext(ApplicationContext);

  return (
    <>
      <h1>Welcome to Recyclopedia</h1>
    </>
  );
}

export default Homepage;
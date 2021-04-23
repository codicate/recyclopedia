import { Link } from 'react-router-dom';

import { validPageLink } from 'utils/functions';
import styles from 'pages/Homepage/Homepage.module.scss'

function Homepage({ api, setArticlesData, articlesData }) {
  return (
    <>
      <h1>Welcome to Recyclopedia</h1>
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
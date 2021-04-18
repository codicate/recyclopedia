import { Link } from 'react-router-dom';
import { validPageLink } from 'utils/functions';

function Homepage({ articlesData }) {
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
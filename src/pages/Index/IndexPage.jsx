import styles from 'pages/Index/IndexPage.module.scss';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { selectArticlesData } from 'app/articlesSlice';

import { ApplicationContext } from 'App';
import { validPageLink } from 'utils/functions';


function IndexPage() {
  const context = useContext(ApplicationContext);
  const articlesData = useAppSelector(selectArticlesData);

  return (
    <div>
      {
        (context.isAdmin) ?
          articlesData.articles.map(({ name, draftStatus }) => (
            <p key={name} >
              <Link to={validPageLink(name)}>
                {(draftStatus) ? "[DRAFT*] " + name : name}
              </Link>
            </p>
          ))
          :
          // I should technically not check for undefined, but okay.
          articlesData.articles
            .filter(({ draftStatus }) => draftStatus === false || draftStatus === undefined)
            .map(({ name }) => (
              <p key={name} >
                <Link to={validPageLink(name)}>
                  {name}
                </Link>
              </p>
            ))
      }
    </div>
  );
}

export default IndexPage;

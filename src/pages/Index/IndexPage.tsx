import styles from 'pages/Index/IndexPage.module.scss';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { selectArticlesData } from 'app/articlesSlice';
import { selectIsAdmin } from 'app/adminSlice';

import { validPageLink } from 'utils/functions';


function IndexPage() {
  const articlesData = useAppSelector(selectArticlesData);
  const isAdmin = useAppSelector(selectIsAdmin);

  return (
    <div className={styles.index}>
      {
        (isAdmin) ?
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

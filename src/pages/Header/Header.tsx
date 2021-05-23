import styles from 'pages/Header/Header.module.scss';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectIsAdmin, setIsAdmin } from 'app/adminSlice';

import approximateSearch from 'utils/search';
import { Secrets } from 'secrets';

import Search, { renderHoverboxSearch } from 'pages/Header/Search';


const Header = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);

  return (
    <header id={styles.header}>
      <nav id={styles.navbar}>

        <Link to="/">
          <div id={styles.logoDiv}></div>
        </Link>
        <Search
          searchFunction={approximateSearch}
          renderFunction={renderHoverboxSearch}
        />
        <Link to='/index'>Index</Link>
        {(
          isAdmin
        ) ? (
          <>
            <Link to="/admin">
              Create New Article
                  </Link>
            <button onClick={() => {
              dispatch(setIsAdmin(false));
            }}
            >
              Logout
                  </button>
          </>
        ) : (
          <button
            onClick={() => {
              if (prompt("Enter Admin Password") === Secrets.ADMIN_PASSWORD) {
                dispatch(setIsAdmin(true));
              }
            }}
          >
            Admin
          </button>
        )}
      </nav>
    </header >
  );
};

export default Header;

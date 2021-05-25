import styles from 'pages/Header/Header.module.scss';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectIsAdmin, setIsAdmin } from 'app/adminSlice';
import { loginWith } from 'app/articlesSlice';

import approximateSearch from 'utils/search';
import { Secrets } from 'secrets';

import Search, { renderHoverboxSearch } from 'pages/Header/Search';
import { User } from 'realm-web';


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
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
    </header >
  );
};

export default Header;

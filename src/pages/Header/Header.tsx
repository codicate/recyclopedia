import styles from "pages/Header/Header.module.scss";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { LoginType, logout, selectLoginType } from "app/adminSlice";

import approximateSearch from "utils/search";
import Search, { renderHoverboxSearch } from "pages/Header/Search";


const Header = () => {
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType);

  return (
    <header id={styles.header}>
      <Link to="/">
        <div id={styles.logoDiv}></div>
      </Link>
      <Search
        searchFunction={approximateSearch}
        renderFunction={renderHoverboxSearch}
      />
      <nav id={styles.navbar}>
        <button className={"material-icons " + styles.menu}>
          menu
        </button>
        <button className={styles.links}>
          <Link to='/index'>Index</Link>
          {
            (
              currentLoginType !== LoginType.Anonymous &&
              currentLoginType !== LoginType.NotLoggedIn
            ) ? (
              // This is for logged users
                <>
                  {
                    (currentLoginType === LoginType.Admin) ?
                      (
                        <>
                          <Link to="/admin/recycling_bin">
                          Recycling Bin
                          </Link>
                          <Link to="/admin">
                          Create New Article
                          </Link>
                        </>
                      ) :
                      <></>
                  }
                  <button
                    onClick={() => {
                      dispatch(logout());
                    }}
                  >
                  Logout
                  </button>
                </>
              ) : (
              // not logged in
                <Link to="/account">Login</Link>
              )}
        </button>
      </nav>
    </header >
  );
};

export default Header;

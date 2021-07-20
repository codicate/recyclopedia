import styles from "./Header.module.scss";
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from "lib/state/hooks";
import { LoginType, logout, selectLoginType } from "lib/state/admin";

import approximateSearch from "lib/utils/search";
import Search, { renderHoverboxSearch } from "components/Header/Search";
import ResponsiveNav from "components/UI/ResponsiveNav";


const Header = () => {
  const dispatch = useAppDispatch();
  const currentLoginType = useAppSelector(selectLoginType);

  return (
    <header id={styles.header}>
      <div id={styles.logoDiv}>
        <Link href="/" >
          <a />
        </Link>
      </div>
      <Search
        searchFunction={approximateSearch}
        renderFunction={renderHoverboxSearch}
      />
      <ResponsiveNav id={styles.navbar}>
        <Link href='/content_index'>Index</Link>
        {(
          currentLoginType !== LoginType.Anonymous &&
          currentLoginType !== LoginType.NotLoggedIn
        ) ?
          (
            // This is for logged users
            <>
              {
                (currentLoginType === LoginType.Admin) ?
                  (
                    <>
                      <Link href="/admin/recycle_bin">
                        Recycling Bin
                      </Link>
                      <Link href="/admin">
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
          ) :
          (
            // not logged in
            <Link href='/account/login'>Login</Link>
          )
        }
      </ResponsiveNav>
    </header >
  );
};

export default Header;

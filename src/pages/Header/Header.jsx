import styles from 'pages/Header/Header.module.scss';
import { Link } from 'react-router-dom';

import { ApplicationContext } from 'App';
import { useContext } from 'react';

import { Secrets } from 'secrets';


const Header = () => {
  const context = useContext(ApplicationContext);

  return (
    <header id={styles.header}>
      <nav id={styles.navbar}>
        <Link to="/">
          <div id={styles.logoDiv}></div>
        </Link>

        {(
          context.isAdmin
        ) ? (
          <Link to="/admin">
            New Article
          </Link>
        ) : (
          <button
            onClick={() => {
              if (prompt("Enter Admin Password") === Secrets.ADMIN_PASSWORD) {
                context.setAdminState(true);
              }
            }}
          >
            Admin
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
import styles from "./Account.module.scss";
import { useState } from "react";

import Button from "components/UI/Button";
import Login from "./Login";
import Register from "./Register";


function Account() {
  const [isNewUser, setIsNewUser] = useState(false);
  return (
    <div className={styles.account}>
      <div className={styles.switchNewUser}>
        {isNewUser ? "Returning user?" : "New user?"}
        <Button
          styledAs="oval"
          onClick={() => setIsNewUser(!isNewUser)}
        >
          {isNewUser ? "Login" : "Register"}
        </Button>
      </div>
      
      {(isNewUser) ? (
        <Register />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default Account;
import styles from "./account.module.scss";
import { useRouter } from "next/router";

import { useAppDispatch } from "state/hooks";
// import { LoginAttemptResult, loginWithEmailAndPassword, LoginType } from "state/admin";
import { LoginAttemptResult, loginWithEmailAndPassword, LoginType } from "state/strapi_test/admin";

import Form from "components/Form/Form";
import Button from "components/UI/Button";


function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div className={styles.account}>
      <div className={styles.switchNewUser}>
        New user?
        <Button
          styledAs="oval"
          onClick={() => router.push("/account/register")}
        >
          Register
        </Button>
      </div>

      <h1>Login With Your Account!</h1>
      <Form
        inputItems={{
          email: {
            selectAllOnFocus: true,
            placeholder: "Email",
            required: true,
          },
          password: {
            selectAllOnFocus: true,
            type: "password",
            placeholder: "Password",
            required: true,
          }
        }}
        submitFn={async (input) => {
          const dispatchRes = await dispatch(loginWithEmailAndPassword(input));
          const loginAttemptResult = dispatchRes.payload as LoginAttemptResult;

          if (loginAttemptResult.type !== LoginType.NotLoggedIn) {
            router.push("/");
          } else {
            alert("bad login");
          }
        }}
      >
        <Button type='submit'>
          Login
        </Button>
      </Form>
    </div>
  );
}

export default Login;
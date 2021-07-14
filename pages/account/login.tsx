import styles from "./account.module.scss";
import { useRouter } from "next/router";

import { useAppDispatch } from "lib/global/hooks";
import { LoginAttemptResult, loginWithEmailAndPassword, LoginType } from "lib/global/adminSlice";

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
          const loginResult = (await dispatch(loginWithEmailAndPassword(input))).payload as LoginAttemptResult;
          console.log(loginResult);

          if (loginResult.type !== LoginType.Anonymous) {
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
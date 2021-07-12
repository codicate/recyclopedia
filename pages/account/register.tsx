import styles from "./account.module.scss";
import { useRouter } from "next/router";

import { registerAccount } from "app/adminSlice";

import Form from "components/Form/Form";
import Button from "components/UI/Button";


function Register() {
  const router = useRouter();

  return (
    <div className={styles.account}>
      <div className={styles.switchNewUser}>
        Returning user?
        <Button
          styledAs="oval"
          onClick={() => router.push("/account/login")}
        >
          Login
        </Button>
      </div>

      <h1>Register a New Account!</h1>
      <Form
        inputItems={{
          email: {
            selectAllOnFocus: true,
            placeholder: "Email",
            required: true,
          },
          password: {
            selectAllOnFocus: true,
            placeholder: "Password",
            type: "password",
            required: true,
          },
          passwordConfirmation: {
            selectAllOnFocus: true,
            placeholder: "Confirm Password",
            type: "password",
            required: true,
          }
        }}
        submitFn={async (input) => {
          if (input.password === input.passwordConfirmation) {
            await registerAccount({
              email: input.email,
              password: input.password
            });

            router.push('/');
          } else {
            alert("Passwords do not match!");
          }
        }}
      >
        <Button type='submit'>Register Account</Button>
      </Form>
    </div>
  );
}

export default Register;
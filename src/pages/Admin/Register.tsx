import styles from "pages/Admin/Register.module.scss";
import { useHistory } from "react-router-dom";

import { useAppDispatch } from "app/hooks";
import { registerAccount } from "app/adminSlice";

import Form from "components/Form/Form";
import Button from "components/Form/Button";


function Register(_: Record<string, never>) {
  const dispatch = useAppDispatch();
  const history = useHistory();

  return (
    <>
      <h1>Register a New Account</h1>
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
            required: true,
          },
          passwordConfirmation: {
            selectAllOnFocus: true,
            placeholder: "Confirm Password",
            required: true,
          }
        }}
        submitFn={async (input) => {
          if (input.password === input.passwordConfirmation) {
            await registerAccount({ email: input.email, password: input.password });
          } else {
            alert("Passwords do not match!");
          }
        }}
      >
        <Button type='submit'>Register Account</Button>
      </Form>
    </>
  );
}

export default Register;
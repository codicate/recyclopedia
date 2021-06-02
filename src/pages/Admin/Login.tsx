import styles from 'pages/Admin/Login.module.scss';
import { useHistory } from 'react-router-dom';

import { useAppDispatch } from 'app/hooks';
import { LoginAttemptResult, loginWithEmailAndPassword, LoginType } from 'app/adminSlice';

import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

function Login(_: {}) {
  const dispatch = useAppDispatch();
  const history = useHistory();
  return (
    <>
      <h1>Login With Your Account!</h1>
      <Form
        inputItems={{
          email: {
            selectAllOnFocus: true,
            placeholder: 'Email',
            required: true,
          },
          password: {
            selectAllOnFocus: true,
            placeholder: 'Password',
            required: true,
          }
        }}
        submitFn={async (input) => {
          const loginResult = (await dispatch(loginWithEmailAndPassword(input))).payload as LoginAttemptResult;
          console.log(loginResult);

          if (loginResult.type !== LoginType.Anonymous) {
            history.push('/');
          } else {
            alert('bad login');
          }
        }}
      >
        <Button type='submit'>Login</Button>
      </Form>
    </>
  );
}

export default Login;
import { createSlice, createDraftSafeSelector, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

import { Credentials } from "realm-web";
import { databaseApi } from 'app/articlesSlice';

interface AccountDetails {
  email: string;
  password: string;
}

const initialState = {
  isAdmin: false,
  accountDetails: {
    email: '',
    password: '',
  }
};

export async function loginWith(information?: { email: string, password: string; }) {
  const credentials = (!information)
    ? Credentials.anonymous()
    : Credentials.emailPassword(information.email, information.password);

  console.log("details ", information);
  let user = undefined;
  try {
    user = await databaseApi.application?.logIn(credentials);
    return { type: "user", user };
  } catch (error) {
    user = await databaseApi.application?.logIn(Credentials.anonymous());
    return { type: "anonymous", user };
  } finally {
    databaseApi.applicationUser = user;
  }
}

export const loginWithEmailAndPassword = createAsyncThunk(
  'admin/loginWithEmailAndPassword',
  async (accountDetails: AccountDetails, { getState }) => {
    const { admin } = getState() as RootState;
    admin.accountDetails = accountDetails;

    const {type, user} = await loginWith(admin.accountDetails);
    console.log(type, user);

    if (type !== "anonymous") {
      console.log("??", user);
      console.log(user?.customData);

      return true;
    }

    console.log('this is a anonymous user')
    return false;
  }
)


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAdmin = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      loginWithEmailAndPassword.fulfilled,
      (state, action) => {
        state.isAdmin = action.payload;
      }
    )
  }
});

export const {
  logout,
} = adminSlice.actions;
export default adminSlice.reducer;

const selectSelf = (state: RootState) => state.admin;


export const selectIsAdmin = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.isAdmin
);

export const selectAccountDetails = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.accountDetails
);
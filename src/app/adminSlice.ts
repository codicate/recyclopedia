import { createSlice, createDraftSafeSelector, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

import { Credentials } from "realm-web";
import { databaseApi } from 'app/articlesSlice';

interface AccountDetails {
  email: string;
  password: string;
}

export interface LoginAttemptResult {
  type: "anonymous" | "user" | "admin",
  accountDetails?: AccountDetails,
}

const initialState = {
  isAdmin: true,
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
    console.log("Does this work?");
    const {type, user} = await loginWith(accountDetails);

    console.log(type, user);

    if (type !== "anonymous") {
      console.log("??", user);
      console.log(user?.customData);
      return {
        accountDetails,
        type: user?.customData.status || type,
      } as LoginAttemptResult;
    }

    console.log('this is a anonymous user')
    return { type } as LoginAttemptResult;
  }
)


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    _forceLogin: (state) => {
      state.isAdmin = true;
    },
    logout: (state) => {
      state.isAdmin = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      loginWithEmailAndPassword.fulfilled,
      (state, action) => {
        const payload = action.payload;

        switch (payload.type) {
          case 'user':
          case 'admin':
            /*
              are there constraints in typescript? I know by this
              point my login object has stuff, so I shouldn't have to check...
            */
            if (payload.accountDetails)
              state.accountDetails = payload.accountDetails;
            state.isAdmin = (payload.type === 'admin');
          break;
          default: break;
        }
      }
    )
  }
});

export const {
  _forceLogin,
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
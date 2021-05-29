import { createSlice, createDraftSafeSelector, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

import { Credentials } from "realm-web";
import { databaseApi } from 'app/articlesSlice';

export enum LoginType {
  Anonymous,
  User,
  Admin,
}

interface AccountDetails {
  email: string;
  password: string;
}

export interface LoginAttemptResult {
  type: LoginType,
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

  let user = undefined;
  try {
    user = await databaseApi.application?.logIn(credentials);
    return { type: LoginType.User, user };
  } catch (error) {
    user = await databaseApi.application?.logIn(Credentials.anonymous());
    return { type: LoginType.Anonymous, user };
  } finally {
    databaseApi.applicationUser = user;
  }
}

export const loginWithEmailAndPassword = createAsyncThunk(
  'admin/loginWithEmailAndPassword',
  async (accountDetails: AccountDetails) => {
    const {type, user} = await loginWith(accountDetails);

    if (type !== LoginType.Anonymous) {
      return {
        accountDetails,
        type: user?.customData.status || type,
      };
    }

    return { type };
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
        const payload = action.payload;

        switch (payload.type) {
          case LoginType.User:
          case LoginType.Admin:
            /*
              are there constraints in typescript? I know by this
              point my login object has stuff, so I shouldn't have to check...
            */
            if (payload.accountDetails)
              state.accountDetails = payload.accountDetails;
            state.isAdmin = (payload.type === LoginType.Admin);
          break;
          default: break;
        }
      }
    )
  }
});

export const { logout, } = adminSlice.actions;
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
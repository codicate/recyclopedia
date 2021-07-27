import { createSlice, createDraftSafeSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "state/store";

import { Credentials } from "realm-web";
import { databaseApi } from "state/articles";

export enum LoginType {
  NotLoggedIn,
  Anonymous,
  User,
  Admin,
}

export interface AccountDetails {
  email: string;
  password: string;
}

export interface LoginAttemptResult {
  type: LoginType,
  accountDetails?: AccountDetails,
}

interface ApplicationState {
  loginType: LoginType | null,
  accountDetails: AccountDetails,
  // I will make this an any for now to avoid having
  // to type it.
  accountCustomData: any,
}

const initialState: ApplicationState = {
  loginType: LoginType.NotLoggedIn,
  accountDetails: {
    email: "",
    // we should probably not be storing this
    // well... actually it's clientside, so it's probably fine...
    password: "",
  },
  accountCustomData: {

  }
};

export async function registerAccount(information: AccountDetails) {
  await databaseApi.application?.emailPasswordAuth.registerUser(information.email, information.password);
}

export async function loginWith(information?: AccountDetails) {
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
  "admin/loginWithEmailAndPassword",
  //@ts-ignore
  async (accountDetails: AccountDetails) => {
    const { type, user } = await loginWith(accountDetails);

    if (type !== LoginType.Anonymous) {
      const possiblyAdminLoginType =
        (user?.customData.status) === "admin" ? LoginType.Admin : false;
      return {
        accountDetails,
        type: possiblyAdminLoginType || type,
        customData: user?.customData,
      };
    }

    return { type };
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logout: (state) => {
      state.loginType = LoginType.NotLoggedIn;
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
            state.accountDetails = payload.accountDetails;
            state.loginType = payload.type;
            state.accountCustomData = payload.customData;
            break;

          default: break;
        }
      }
    );
  }
});

export const {
  logout
} = adminSlice.actions;
export default adminSlice.reducer;

const selectSelf = (state: RootState) => state.admin;

export const selectLoginType = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.loginType
);

export const selectAccountDetails = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.accountDetails
);

// This should be more specifically typed
// however this isn't finalized so let's not do that.
export const selectAccountCustomData = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.accountCustomData
);
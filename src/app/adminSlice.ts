import { createSlice, createDraftSafeSelector, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'app/store';
import { callbackify } from 'util';
import { loginWith } from './articlesSlice';

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
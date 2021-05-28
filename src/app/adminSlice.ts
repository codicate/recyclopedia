import { createSlice, createDraftSafeSelector, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'app/store';
import { loginWith } from './articlesSlice';

const initialState = {
  isAdmin: false,
  accountDetails: {
    email: '',
    password: '',
  }
};


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAdmin = false;
    },
    loginWithEmailAndPassword: (state, action: PayloadAction<{ email: string, password: string }>) => {
      state.accountDetails = action.payload;
      const userResult = loginWith(action.payload);
      if (userResult)
        state.isAdmin = true;
      else
        state.isAdmin = false;
    }
  }
});

export const {
  logout,
  loginWithEmailAndPassword
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
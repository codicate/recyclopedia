import { createSlice, createDraftSafeSelector, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'app/store';


const initialState = {
  isAdmin: false
};


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    }
  }
});

export const {
  setIsAdmin
} = adminSlice.actions;
export default adminSlice.reducer;

const selectSelf = (state: RootState) => state.admin;


export const selectIsAdmin = createDraftSafeSelector(
  selectSelf,
  (admin) => admin.isAdmin
);
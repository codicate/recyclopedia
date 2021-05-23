import { createSlice, createAsyncThunk, createDraftSafeSelector } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';
import { RootState } from 'app/store';

import { App, User } from "realm-web";
import { Secrets } from 'secrets';
// import { RecyclopediaApplicationContext } from 'utils/RecyclopediaApplicationContext';

const initialState: {
  status: 'idle' | 'loading' | 'succeed' | 'failed';
  api: any;
  application: App | undefined | null;
  applicationUser: User | undefined | null;
} = {
  status: 'idle',
  api: null,
  application: null,
  applicationUser: null
};



export const initApi = createAsyncThunk(
  'api/initApi',
  async (appId: string, { rejectWithValue }) => {
    const anonymousCredentials = Realm.Credentials.anonymous();
    const application = new App({ id: appId });

    try {
      const applicationUser = await application.logIn(anonymousCredentials);
      return { application, applicationUser };
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error);
    }
  }
);

export const queryForArticles = createAsyncThunk(
  'api/queryForArticles',
  async (query, { getState, rejectWithValue }) => {
    // I should "lazy-init" login this
    // however I forced a buffer load, before anything happens
    // so I am guaranteed to have a user unless we couldn't login for some reason.

    const state = getState();

    if (state.api.applicationUser) {
      return (async function () {
        if (query) {
          return await this.applicationUser.functions.getAllArticles(query);
        } else {
          return await this.applicationUser.functions.getAllArticles();
        }
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }

    return undefined;
  }
);


const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    deleteArticle: (name) => {
      if (this.applicationUser) {
        (async function () {
          this.applicationUser.functions.removeArticle(name);
        }).bind(this)();
      } else {
        console.error("No user? This is bad news.");
      }
    },
    insertArticle: (articleContents) => {
      if (this.applicationUser) {
        (async function () {
          await this.applicationUser.functions.createOrUpdateArticle(articleContents);
        }).bind(this)();
      } else {
        console.error("No user? This is bad news.");
      }

      return undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      initApi.pending,
      (state) => {
        state.status = 'loading';
      }
    ).addCase(
      initApi.rejected,
      (state) => {
        state.status = 'failed';
      }
    ).addCase(
      initApi.fulfilled,
      (state, action) => {
        state.status = 'succeed';
        state.application = action.payload?.application;
        state.applicationUser = action.payload?.applicationUser;
      }
    );
  }
});

export const {

} = apiSlice.actions;
export default apiSlice.reducer;

const selectSelf = (state: RootState) => state.api;

export const selectApi = createDraftSafeSelector(
  selectSelf,
  (api) => api
);
import { createSlice, createAsyncThunk, createDraftSafeSelector } from '@reduxjs/toolkit';
import { RootState } from 'app/store';
import { loginWithEmailAndPassword, selectAccountDetails } from 'app/adminSlice'
import ArticleComponent from 'components/Article/Article';

import { App, User, Credentials } from "realm-web";

export interface Article {
  name: string;
  content: string;
  draftStatus: boolean;
  tags?: string[];
}

export interface ArticlesData {
  articles: Article[];
};

export type ArticlesDataProperties = {
  articlesData: ArticlesData;
};

export const databaseApi: {
  application: App | undefined | null;
  applicationUser: User | undefined | null;
} = {
  application: null,
  applicationUser: null
};

const initialState: {
  status: 'idle' | 'loading' | 'succeed' | 'failed';
  articlesData: ArticlesData;
} = {
  status: 'idle',
  articlesData: {
    articles: []
  },
};

function tryToCallWithUser(fn) {
  return async function(argument, thunkApi) {
    try {
      if (databaseApi.applicationUser) {
        return await fn(databaseApi.applicationUser, argument, thunkApi);
      } else {
        throw new Error("No user? This is some real bad news");
      }
    } catch (error) {
      console.error("Call with user error: ", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
}

export const initApi = createAsyncThunk(
  'articles/initApi',
  tryToCallWithUser(
    async function (user: Realm.User, appId: string, { getState, dispatch }) {
      const state = getState() as RootState;
      const accountDetails = state.admin.accountDetails;

      await dispatch(loginWithEmailAndPassword(accountDetails));
      await dispatch(queryForArticles(undefined));
    }
  )
);

export const queryForArticles = createAsyncThunk(
  'articles/queryForArticles',
  tryToCallWithUser(
    async function(user: Realm.User, query?: any, thunkApi: any) {
      return await user.functions.getAllArticles();
    }
  )
);

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  tryToCallWithUser(
    async function(user: Realm.User, name: string, {dispatch}) {
      await user.functions.removeArticle(name);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const insertArticle = createAsyncThunk(
  'articles/insertArticle',
  tryToCallWithUser(
    async function(user: Realm.User, articleContent: Article, {dispatch}) {
      await user.functions.createOrUpdateArticle(articleContent);
      dispatch(queryForArticles(undefined));
    }
  )
);

const articlesSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {},
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
      (state) => {
        state.status = 'succeed';
      }
    ).addCase(
      queryForArticles.fulfilled,
      (state, action) => {
        state.articlesData = action.payload;
      }
    );
  }
});

export default articlesSlice.reducer;
const selectSelf = (state: RootState) => state.articles;

export const selectStatus = createDraftSafeSelector(
  selectSelf,
  (articles) => articles.status
);

export const selectArticlesData = createDraftSafeSelector(
  selectSelf,
  (articles) => articles.articlesData
);
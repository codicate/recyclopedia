import { createSlice, createAsyncThunk, createDraftSafeSelector } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

import { App, User, Credentials } from "realm-web";

interface Article {
  name: string;
  content: string;
}

const databaseApi: {
  application: App | undefined | null;
  applicationUser: User | undefined | null;
} = {
  application: null,
  applicationUser: null
};

const initialState: {
  status: 'idle' | 'loading' | 'succeed' | 'failed';
  articlesData: {
    articles: Article[];
  };
} = {
  status: 'idle',
  articlesData: {
    articles: []
  },
};


export const initApi = createAsyncThunk(
  'articles/initApi',
  async (appId: string, { dispatch, rejectWithValue }) => {
    try {
      const anonymousCredentials = Credentials.anonymous();
      databaseApi.application = new App({ id: appId });
      databaseApi.applicationUser = await databaseApi.application.logIn(anonymousCredentials);

      dispatch(queryForArticles());
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const queryForArticles = createAsyncThunk(
  'articles/queryForArticles',
  async (query: string | undefined, { rejectWithValue }) => {
    // I should "lazy-init" login this
    // however I forced a buffer load, before anything happens
    // so I am guaranteed to have a user unless we couldn't login for some reason.

    try {
      if (databaseApi.applicationUser) return await databaseApi.applicationUser.functions.getAllArticles();
      else throw new Error('No user? This is bad news');
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (name: string, { dispatch, rejectWithValue }) => {

    try {
      if (databaseApi.applicationUser) {
        await databaseApi.applicationUser.functions.removeArticle(name);
        dispatch(queryForArticles());
      } else {
        throw new Error('No user? This is bad news');
      }
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const insertArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (articleContent: Article, { dispatch, rejectWithValue }) => {

    try {
      if (databaseApi.applicationUser) {
        await databaseApi.applicationUser.functions.createOrUpdateArticle(articleContent);
        dispatch(queryForArticles());
      } else {
        throw new Error('No user? This is bad news');
      }
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
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

// export const {

// } = apiSlice.actions;
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
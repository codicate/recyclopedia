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

const databaseApi: {
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

export async function loginWith(information?: { email: string, password: string; }) {
  const credentials = (!information)
    ? Credentials.anonymous()
    : Credentials.emailPassword(information.email, information.password);

  console.log("details ", information);
  try {
    console.log("good?");
    const user = await databaseApi.application?.logIn(credentials);
    databaseApi.applicationUser = user;
    return { type: "user", user };
  } catch (error) {
    console.log("bad?");
    console.error(error);
    const user = await databaseApi.application?.logIn(Credentials.anonymous());
    databaseApi.applicationUser = user;
    return { type: "anonymous", user };
  }
}

export const initApi = createAsyncThunk(
  'articles/initApi',
  async (appId: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      databaseApi.application = new App({ id: appId });
      const accountDetails = state.admin.accountDetails;
      
      await dispatch(loginWithEmailAndPassword(accountDetails));
      await dispatch(queryForArticles(undefined));
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const queryForArticles = createAsyncThunk(
  'articles/queryForArticles',
  /*
    the query is actually a dictionary, but it is very varied, I'll fill this out
    later.
  */
  async (query: any | undefined, { rejectWithValue }) => {
    // I should "lazy-init" login this
    // however I forced a buffer load, before anything happens
    // so I am guaranteed to have a user unless we couldn't login for some reason.

    try {
      if (databaseApi.applicationUser)
        return await databaseApi.applicationUser.functions.getAllArticles();
      else
        throw new Error('No user? This is bad news');
      alert('oh no');
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
        dispatch(queryForArticles(undefined));
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
        dispatch(queryForArticles(undefined));
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
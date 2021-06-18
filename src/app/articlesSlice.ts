import { createSlice, createAsyncThunk, createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { loginWithEmailAndPassword } from "app/adminSlice";

import { useAppSelector } from "./hooks";
import { selectLoginType, LoginType } from "app/adminSlice";

import { App, User, Credentials } from "realm-web";
import { MessageLogType, logMessage } from "utils/functions";

export interface Article {
  name: string;
  content: string;
  draftStatus: boolean;
  tags?: string[];
}

export interface RecycledArticle extends Article {
  pendingDaysUntilDeletion: number;
}

export interface ArticlesData {
  featuredArticle: string | null,
  articles: Article[];
  recycledArticles: RecycledArticle[];
}

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
    status: "idle" | "loading" | "succeed" | "failed";
    articlesData: ArticlesData;
    allTags: string[];
} = {
  status: "idle",
  articlesData: {
    featuredArticle: null,
    articles: [],
    recycledArticles: [],
  },
  allTags: []
};

// @ts-ignore
function tryToCallWithUser(fn) {
// @ts-ignore
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
  };
}

export const initApi = createAsyncThunk(
  "articles/initApi",
  async (appId: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      databaseApi.application = new App({ id: appId });
      const accountDetails = state.admin.accountDetails;
            
      await dispatch(loginWithEmailAndPassword(accountDetails));
      dispatch(queryForArticles(undefined));
      dispatch(queryForAllTags(undefined));
    } catch (error) {
      console.error("Failed to login because: ", error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const queryForArticles = createAsyncThunk(
  "articles/queryForArticles",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, query?: any, thunkApi: any) {
      return await user.functions.getAllArticles();
    }
  )
);

export const queryForAllTags = createAsyncThunk(
  "articles/queryForAllTags",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, _: any, thunkApi: any) {
      return await user.functions.getAllTags();
    }
  )
);

interface MigrationParameters {
    name: string,
    newName: string,
}

/*
  It annoys me that these single thunks require so much boiler plate...
*/
export const migrateArticle = createAsyncThunk(
  "articles/migrateArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, migrationParams: MigrationParameters, {dispatch}) {
      const result = await user.functions.migrateArticle(migrationParams.name, migrationParams.newName);
      dispatch(queryForArticles(undefined));
      return result;
    }
  )
);

export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, name: string, {dispatch}) {
      await user.functions.removeArticle(name);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const restoreArticle = createAsyncThunk(
  "articles/restoreArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, name: string, {dispatch}) {
      await user.functions.restoreArticle(name);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const insertArticle = createAsyncThunk(
  "articles/insertArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, articleContent: Article, {dispatch}) {
      await user.functions.createOrUpdateArticle(articleContent);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const setFeaturedArticle = createAsyncThunk(
  "articles/setFeaturedArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function(user: Realm.User, articleTitle: string, {dispatch}) {
      await user.functions.featureArticleByName(articleTitle);
      dispatch(queryForArticles(undefined));
    }
  )
);

const articlesSlice = createSlice({
  name: "api",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      initApi.pending,
      (state) => {
        state.status = "loading";
      }
    ).addCase(
      initApi.rejected,
      (state) => {
        state.status = "failed";
      }
    ).addCase(
      initApi.fulfilled,
      (state) => {
        state.status = "succeed";
      }
    ).addCase(
      queryForArticles.fulfilled,
      (state, action) => {
        state.articlesData = action.payload;
      }
    ).addCase(
      queryForAllTags.fulfilled,
      (state, action) => {
        state.allTags = action.payload.slice(0);
        logMessage(MessageLogType.General, "Loaded Tags: ", state.allTags);
      }
    );
  }
});

export default articlesSlice.reducer;
const selectSelf = (state: RootState) => state.articles;

// shouldn't it be possible to programmatically generate these instead
// of copy and paste? Like building the export dictionary manually?
export const selectStatus = createDraftSafeSelector(
  selectSelf, (articles) => articles.status
);

export const selectArticlesData = createDraftSafeSelector(
  selectSelf, (articles) => articles.articlesData 
);

export const selectNameOfFeaturedArticle = createDraftSafeSelector(
  selectSelf, (articles) => articles.articlesData.featuredArticle
);

export function readArticlesFromLoginType() : ArticlesData {
  const loginType = useAppSelector(selectLoginType);
  const articlesData = useAppSelector(selectArticlesData);

  if (loginType === LoginType.Admin) {
    return articlesData;
  } else {
    const newArticleSet =
      articlesData.articles.filter((article) => !article.draftStatus);
    return {
      ... articlesData,
      articles: newArticleSet,
    };
  }
}

export const selectAllTags = createDraftSafeSelector(
  selectSelf,
  (articles) => {
    return articles.allTags.slice(0);
  }
);

// ... Yeah this has gotta go.

import { createSlice, createAsyncThunk, createDraftSafeSelector } from "@reduxjs/toolkit";
import { AppState } from "state/store";
import {
  selectLoginType,
  selectUserInformation,
  LoginType,
  AccountDetails,
  loginWithEmailAndPassword,
  User,
} from "state/strapi_test/admin";
import { useAppSelector } from "state/hooks";

import { VoteModel, VoteType, CommentModel, ArticleModel } from 'lib/models';
import Secrets from "secrets";
import { useEffect } from "react";

import {
  getArticles,
  getArticleComments,
  addArticleComment,
  // TODO(jerry): rename?
  deleteArticle as _deleteArticle,
  restoreArticle as _restoreArticle,
  insertArticle as _insertArticle,
  articleVote   as _articleVote,
  commentVote   as _commentVote,
  getVotesOfArticle as _getVotesOfArticle,
} from 'lib/api/strapi_test/all';

export interface RecycledArticle extends ArticleModel {
  pendingDaysUntilDeletion: number;
}

export interface ArticlesData {
  featuredArticle: string | null,
  articles: ArticleModel[];
  recycledArticles: RecycledArticle[];
}

export type ArticlesDataProperties = {
  articlesData: ArticlesData;
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

export const initApi = createAsyncThunk(
  "articles/initApi",
  async (appId: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as AppState;
    const accountDetails = state.admin.accountDetails;
    if (accountDetails) {
      await dispatch(loginWithEmailAndPassword(accountDetails));
    } else {
      console.log("no details!");
    }
  }
);

// Since we no longer have the loading stage...
// Our login *may* fail to complete fast enough before the page loads.
// This will force an initApi if it has not already happened.
// Grrr... No I don't really like this either. We really need to come together
// to refactor, but the problem is there's so much (well 5K lines is pretty small...), that we don't really know
// where to get started. 

// @ts-ignore
export function useEffectWithGuaranteedInitializedApi(dispatch, effector, dependencyArray) {
  useEffect(
    function () {
      (async function () {
        await dispatch(initApi(Secrets.RECYCLOPEDIA_APPLICATION_ID));
        effector();
      })();
    } , 
    dependencyArray);
}

export const queryForArticles = createAsyncThunk(
  "articles/queryForArticles",
  async function (_, { getState, dispatch, rejectWithValue }) {
    // TODO(jerry): dummy, until we actually add all dates for articles
    const articles = await getArticles();
    return articles;
  }
);

export const queryForAllTags = createAsyncThunk(
  "articles/queryForAllTags",
  async function() {

  }
);

interface MigrationParameters {
  name: string,
  newName: string,
}

// It annoys me that these single thunks require so much boiler plate...
export const migrateArticle = createAsyncThunk(
  "articles/migrateArticle",
  async function() {

  }
  // tryToCallWithUser(
  //   // @ts-ignore
  //   async function (user: Realm.User, migrationParams: MigrationParameters, { dispatch }) {
  //     const result = await user.functions.migrateArticle(migrationParams.name, migrationParams.newName);
  //     dispatch(queryForArticles(undefined));
  //     return result;
  //   }
  // )
);

export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  async function(name: string, { getState }) {
    const { admin } = getState() as AppState;
    if (admin.loginType === LoginType.Admin) {
      const accessToken = admin.userInformation?.accessToken;
      _deleteArticle(name, accessToken);
    }
  }
);

export const restoreArticle = createAsyncThunk(
  "articles/restoreArticle",
  async function(name: string, { getState }) {
    const { admin } = getState() as AppState;
    if (admin.loginType === LoginType.Admin) {
      const accessToken = admin.userInformation?.accessToken;
      _restoreArticle(name, accessToken);
    }
  }
);

export const insertArticle = createAsyncThunk(
  "articles/insertArticle",

  async (articleData: ArticleModel, { getState, dispatch, rejectWithValue }) => {
    const { admin } = getState() as AppState;
    if (admin.loginType === LoginType.Admin) {
      // If only there were a way to tie the "existance" of a variable
      // to something else?
      const accessToken  = admin.userInformation?.accessToken;
      if (accessToken) {
        _insertArticle(articleData, accessToken);
      }
    }
  }
);

export const setFeaturedArticle = createAsyncThunk(
  "articles/setFeaturedArticle",
  async function() {

  }
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
        // @ts-ignore
        state.articlesData = action.payload;
      }
    ).addCase(
      queryForAllTags.fulfilled,
      (state, action) => {
        // @ts-ignore
        state.allTags = action.payload.slice(0);
      }
    );
  }
});

export default articlesSlice.reducer;
const selectSelf = (state: AppState) => state.articles;

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

// implicitly uses the state of the logged-in user!
export function buildCommentDraft(loginType: LoginType, userInformation: User | undefined | null, comment: string) {
  const commentContents = {
    content: comment,
    createdAt: new Date(),
    user: {
      name: 'Anonymous User',
      avatar: "/public/images/vora-is-hot-af.png"
    },
  };

  // @ts-ignore
  const commentDraft: CommentModel =
    (loginType === LoginType.NotLoggedIn)
      ? commentContents
      : {
        ...commentContents,
  // @ts-ignore
        user: {id: userInformation.id}
      };

  return commentDraft;
}

export async function addComment(loginType: LoginType, userInformation: User | undefined | null, articleName: string, comment: string) {
  const completedComment = {
    ...buildCommentDraft(loginType, userInformation, comment),
    replies: [] // TODO(jerry): remove reply support, not needed!
  };
  await addArticleComment(articleName, completedComment);
}

export async function deleteComment(articleName: string, commentId: number) {
  /*
    As of writing this, this function does not exist!
    remove this when it does.
  */
  alert("This function is a shim and does not work yet!");
}

// parentId:
// will have to be a more special type of id to prevent against weird issues
// when deleting. This is not done yet. (some sort of GUID) basically.
export async function replyToComment(loginType: LoginType, accountDetails: AccountDetails, articleName: string, parentId: number, comment: string) {
  // not happening.
}

export async function articleVote(userInformation: User, articleName: string, voteType: VoteType) {
  await _articleVote(userInformation, articleName, VoteModel.toString(voteType));
}
// NOTE(jerry):
// VoteTarget is no longer needed because we've never used the reply functionality
// so let's just phase it out.

// article name is no longer needed because strapi stores things in a row/tables format
// and not document based like MongoDB, also apparently Strapi 4 will drop MongoDB support...
// So this is kind of what's going to happen anyways.
export async function commentVote(userInformation: User, voteType: VoteType, commentId: number) {
  await _commentVote(userInformation, commentId, VoteModel.toString(voteType));
}

export async function getCommentsOfArticle(name: string) {
  const fetchedComments = getArticleComments(name);

  if (fetchedComments) {
    return fetchedComments;
  } else {
    return [];
  }
}

export async function getVotesOfArticle(name: string) {
  return _getVotesOfArticle(name);
}

export function readArticlesFromLoginType(): ArticlesData {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loginType = useAppSelector(selectLoginType);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const articlesData = useAppSelector(selectArticlesData);
  return articlesData || [];
}

export const selectAllTags = createDraftSafeSelector(
  selectSelf,
  (articles) => {
    return articles.allTags.slice(0);
  }
);

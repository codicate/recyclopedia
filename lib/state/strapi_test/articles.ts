// ... Yeah this has gotta go.

import { createSlice, createAsyncThunk, createDraftSafeSelector } from "@reduxjs/toolkit";
import { AppState } from "state/store";
import {  selectLoginType, LoginType, AccountDetails, loginWithEmailAndPassword } from "state/strapi_test/admin";
import { useAppDispatch, useAppSelector } from "state/hooks";

import { VoteType, CommentModel, ArticleModel } from 'lib/models';
import Secrets from "secrets";
import { useEffect } from "react";

import {
  getArticles,
  getArticleLinks,
  getArticleTags,
  getRecycleBinArticles,
  getArticleComments,
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
    console.log(">?");
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
  async function() {

  }
  // tryToCallWithUser(
  //   // @ts-ignore
  //   async function (user: Realm.User, name: string, { dispatch }) {
  //     await user.functions.removeArticle(name);
  //     dispatch(queryForArticles(undefined));
  //   }
  // )
);

export const restoreArticle = createAsyncThunk(
  "articles/restoreArticle",
  async function() {

  }
  // tryToCallWithUser(
  //   // @ts-ignore
  //   async function (user: Realm.User, name: string, { dispatch }) {
  //     await user.functions.restoreArticle(name);
  //     dispatch(queryForArticles(undefined));
  //   }
  // )
);

export const insertArticle = createAsyncThunk(
  "articles/insertArticle",
  async function() {

  }
  // tryToCallWithUser(
  //   // @ts-ignore
  //   async function (user: Realm.User, articleContent: Article, { dispatch }) {
  //     console.log("stub");
  //     dispatch(queryForArticles(undefined));
  //   }
  // )
);

export const setFeaturedArticle = createAsyncThunk(
  "articles/setFeaturedArticle",
  async function() {

  }
  // tryToCallWithUser(
  //   // @ts-ignore
  //   async function (user: Realm.User, articleTitle: string | null, { dispatch }) {
  //     console.log('stub');
  //     dispatch(queryForArticles(undefined));
  //   }
  // )
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
export function buildCommentDraft(loginType: LoginType, accountDetails: AccountDetails, comment: string) {
  const commentContents = {
    content: comment,
    createdAt: new Date(),
    votes: [],
    user: {
      name: 'Anonymous User',
      avatar: "/public/images/vora-is-hot-af.png"
    }
  };

  const commentDraft: CommentModel =
    (loginType === LoginType.NotLoggedIn)
      ? commentContents
      : {
        ...commentContents,
        user: {
          name: accountDetails.email,
          // comments should not really have avatars in the future.
          avatar: "/public/images/vora-is-hot-af.png", 
        }
      };

  return commentDraft;
}

export async function addComment(loginType: LoginType, accountDetails: AccountDetails, articleName: string, comment: string) {
  const completedComment = {
    ...buildCommentDraft(loginType, accountDetails, comment),
    replies: []
  };

  // await tryToCallWithUser(
  //   async function (user: Realm.User, _: any, _1: any) {
  //     await user.functions.addComment(articleName, completedComment);
  //   }
  // )(undefined, {});
}

export async function deleteComment(articleName: string, commentId: number) {
  /*
    As of writing this, this function does not exist!
    remove this when it does.
  */
  alert("This function is a shim and does not work yet!");
  // await tryToCallWithUser(
  //   async function (user: Realm.User, _: any, _1: any) {
  //     await user.functions.removeComment(articleName, commentId);
  //   }
  // )(undefined, {});
}

// parentId:
// will have to be a more special type of id to prevent against weird issues
// when deleting. This is not done yet. (some sort of GUID) basically.
export async function replyToComment(loginType: LoginType, accountDetails: AccountDetails, articleName: string, parentId: number, comment: string) {
  const completedComment = buildCommentDraft(loginType, accountDetails, comment);

  // await tryToCallWithUser(
  //   async function (user: Realm.User, _: any, _1: any) {
  //     await user.functions.replyToComment(articleName, parentId, completedComment);
  //   }
  // )(undefined, {});
}

export type ArticleVoteTarget = string;
export interface VoteTarget {
  id: number,
  // replies should also be GUIDed somehow.
  replyId?: number,
}

// To be as quick as possible, we will ignorantly just vote ignorantly
// without associating votes. We can use localStorage to emulate what I'm requesting
// but for obvious reasons localStorage is pretty easy to do vote fraud with.
// and I'm quite a fan of democracy so let's not try to fake it, for now let's just not do it.
type VoteTypeString = "like" | "dislike" | "unknown";
function voteTypeToString(voteType: VoteType): VoteTypeString {
  switch (voteType) {
    case VoteType.Like:
      return "like";
    case VoteType.Dislike:
      return "dislike";
    default:
      return "unknown";
  }
}
export async function articleVote(loginType: LoginType, articleName: string, voteType: VoteType) {
  if (loginType === LoginType.NotLoggedIn)
    return;

  // await tryToCallWithUserWithoutRedux(
  //   async function (user: Realm.User, _: any, _1: any) {
  //     await user.functions.articleVote(articleName, voteTypeToString(voteType), user.id);
  //   }
  // )(undefined);
}
export async function commentVote(loginType: LoginType, articleName: string, voteType: VoteType, target: VoteTarget) {
  if (loginType === LoginType.NotLoggedIn)
    return;

  // await tryToCallWithUserWithoutRedux(
  //   async function (user: Realm.User, _: any, _1: any) {
  //     await user.functions.commentVote(articleName, voteTypeToString(voteType), target, user.id);
  //   }
  // )(undefined);
}

export async function getCommentsOfArticle(name: string) {
  const fetchedComments = getArticleComments(name);

  console.log(fetchedComments);

  if (fetchedComments) {
    return fetchedComments;
  } else {
    return [];
  }
}

export async function getVotesOfArticle(name: string) {
  return [];
  // const fetchedVotes = await tryToCallWithUserWithoutRedux(
  //   async function (user: Realm.User, _argument: any, _: any) {
  //     const votes = await user.functions.getVotesOfArticle(name);
  //     return votes;
  //   })(undefined);

  // if (fetchedVotes) {
  //   return fetchedVotes;
  // } else {
  //   return [];
  // }
}

export function readArticlesFromLoginType(): ArticlesData {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loginType = useAppSelector(selectLoginType);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const articlesData = useAppSelector(selectArticlesData);
  return articlesData;

  // if (loginType === LoginType.Admin) {
  //   return articlesData;
  // } else {
  //   const newArticleSet =
  //     articlesData.articles.filter((article) => !article.draftStatus);
  //   return {
  //     ...articlesData,
  //     articles: newArticleSet,
  //   };
  // }
}

export const selectAllTags = createDraftSafeSelector(
  selectSelf,
  (articles) => {
    return articles.allTags.slice(0);
  }
);

/*
  NOTE(jerry):
    Okay, now most of the stuff we care about is done. I need to now start tightening down on security.
    There's some holes we can't avoid (merely just because we have this code downloaded onto the browser), however
    I do not authenticate any of the data we send over, so I'll have to work on that later.

    Thankfully all of these functions are user/login authenticated with permissions, so only invalid data can brick
    things, and you still need to be logged in properly to break stuff.

    setFeaturedArticle is the only one I'm aware of with bad data.
*/

import { CommentModel, TopLevelCommentModel } from "components/Comment/Comment";

import { createSlice, createAsyncThunk, createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "lib/global/store";
import { AccountDetails, loginWithEmailAndPassword } from "lib/global/adminSlice";

import { selectAccountCustomData, selectAccountDetails, selectLoginType, LoginType } from "lib/global/adminSlice";
import { useAppSelector } from "lib/global/hooks";

import { App, User, Credentials } from "realm-web";
import { MessageLogType, logMessage } from "lib/functions";

import { VoteType, ArticleModel } from 'lib/models';



// This is a partial version of the article
// with optional fields. This is because we won't necessarily
// be filling out all the fields.
export interface ArticleDraft {
  name: string;
  content: string;
  dateCreated?: number;
  tags?: string[];
}

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
  return async function (argument, thunkApi) {
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
    async function (user: Realm.User, query?: any, thunkApi: any) {
      // TODO(jerry): dummy, until we actually add all dates for articles
      const articles = await user.functions.getArticles();
      return articles;
    }
  )
);

export const queryForAllTags = createAsyncThunk(
  "articles/queryForAllTags",
  tryToCallWithUser(
    // @ts-ignore
    async function (user: Realm.User, _: any, thunkApi: any) {
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
    async function (user: Realm.User, migrationParams: MigrationParameters, { dispatch }) {
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
    async function (user: Realm.User, name: string, { dispatch }) {
      await user.functions.removeArticle(name);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const restoreArticle = createAsyncThunk(
  "articles/restoreArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function (user: Realm.User, name: string, { dispatch }) {
      await user.functions.restoreArticle(name);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const insertArticle = createAsyncThunk(
  "articles/insertArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function (user: Realm.User, articleContent: Article, { dispatch }) {
      await user.functions.createOrUpdateArticle(articleContent);
      dispatch(queryForArticles(undefined));
    }
  )
);

export const setFeaturedArticle = createAsyncThunk(
  "articles/setFeaturedArticle",
  tryToCallWithUser(
    // @ts-ignore
    async function (user: Realm.User, articleTitle: string | null, { dispatch }) {
      await user.functions.setFeaturedArticle(articleTitle);
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

// implicitly uses the state of the logged-in user!
export function buildCommentDraft(loginType: LoginType, accountDetails: AccountDetails, comment: string) {
  const currentDate = new Date();

  const commentContents = {
    content: comment,
    createdAt: currentDate,
    votes: [],
  };

  const commentDraft: CommentModel =
    (loginType === LoginType.Anonymous || loginType === LoginType.NotLoggedIn)
      ? commentContents
      : {
        ...commentContents,
        user: {
          name: accountDetails.email,
          // comments should not really have avatars in the future.
          avatar: "https://lh6.googleusercontent.com/-f9MhM40YFzc/AAAAAAAAAAI/AAAAAAABjbo/iG_SORRy0I4/photo.jpg",
        }
      };

  return commentDraft;
}

export async function addComment(loginType: LoginType, accountDetails: AccountDetails, articleName: string, comment: string) {
  const completedComment = {
    ...buildCommentDraft(loginType, accountDetails, comment),
    replies: []
  };

  await tryToCallWithUser(
    async function (user: Realm.User, _: any, _1: any) {
      await user.functions.addComment(articleName, completedComment);
    }
  )(undefined, {});
}

export async function deleteComment(articleName: string, commentId: number) {
  /*
    As of writing this, this function does not exist!
    remove this when it does.
  */
  alert("This function is a shim and does not work yet!");
  await tryToCallWithUser(
    async function (user: Realm.User, _: any, _1: any) {
      await user.functions.removeComment(articleName, commentId);
    }
  )(undefined, {});
}

// parentId:
// will have to be a more special type of id to prevent against weird issues
// when deleting. This is not done yet. (some sort of GUID) basically.
export async function replyToComment(loginType: LoginType, accountDetails: AccountDetails, articleName: string, parentId: number, comment: string) {
  const completedComment = buildCommentDraft(loginType, accountDetails, comment);

  await tryToCallWithUser(
    async function (user: Realm.User, _: any, _1: any) {
      await user.functions.replyToComment(articleName, parentId, completedComment);
    }
  )(undefined, {});
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
  if (loginType === LoginType.Anonymous || loginType === LoginType.NotLoggedIn)
    return;

  await tryToCallWithUser(
    async function (user: Realm.User, _: any, _1: any) {
      await user.functions.articleVote(articleName, voteTypeToString(voteType), user.id);
    }
  )(undefined, {});
}
export async function commentVote(loginType: LoginType, articleName: string, voteType: VoteType, target: VoteTarget) {
  if (loginType === LoginType.Anonymous || loginType === LoginType.NotLoggedIn)
    return;

  await tryToCallWithUser(
    async function (user: Realm.User, _: any, _1: any) {
      await user.functions.commentVote(articleName, voteTypeToString(voteType), target, user.id);
    }
  )(undefined, {});
}

export async function getCommentsOfArticle(name: string) {
  // tryToCallWithUser was supposed to reduce the redundancy for reducers
  // so this looks weird.
  const fetchedComments = await tryToCallWithUser(
    async function (user: Realm.User, _argument: any, _: any) {
      const comments = await user.functions.getCommentsOfArticle(name);
      return comments;
    })(undefined, undefined);

  if (fetchedComments) {
    return fetchedComments;
  } else {
    return [];
  }
}

export function readArticlesFromLoginType(): ArticlesData {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loginType = useAppSelector(selectLoginType);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const articlesData = useAppSelector(selectArticlesData);

  if (loginType === LoginType.Admin) {
    return articlesData;
  } else {
    const newArticleSet =
      articlesData.articles.filter((article) => !article.draftStatus);
    return {
      ...articlesData,
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

import * as Requests from 'lib/requests';

// When we get real deployment make this an environment variable.
const STRAPI_INSTANCE_URL = "http://localhost:1337";

import { CommentModel, RecycleBinArticleModel, VoteModel, VoteType } from 'lib/models';
import { validPageLink } from 'lib/functions';
import { ArticleModel } from 'lib/models';
import { User } from "state/strapi_test/admin";

export type ArticleLink = Pick<ArticleModel, 'name' | 'draftStatus' | 'tags'>;

// NOTE(jerry): Deduplicate later.
// NOTE(jerry): recycled_articles will produce the same results as /articles/ for now,
//              with the only exception being that just flat /recycled_articles/ will filter out all articles.
//              Any other methods will proceed to act identically.
export async function getRecycledArticle(articleName: string) {
  const { data } = await Requests.get_safe<any>( `${STRAPI_INSTANCE_URL}/recycled_articles/by_name/${articleName}`, ArticleModel.default);
  const {
    name, content, created_at, updated_at, tags, votes, comments
  } = data;
  return {
    ... ArticleModel.default,
    name,
    content,
    createdAt: created_at,
    updatedAt: updated_at,
    tags,
    votes,
    comments
  } as ArticleModel;
}
export async function getArticle(articleName: string) {
  const { data } = await Requests.get_safe<any>( `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}`, ArticleModel.default);
  const {
    name, content, created_at, updated_at, tags, votes, comments
  } = data;
  return {
    ... ArticleModel.default,
    name,
    content,
    createdAt: created_at,
    updatedAt: updated_at,
    tags,
    votes,
    comments
  } as ArticleModel;
}

async function getCommentById(id: number) {
  // I assume that you know that the comment exists here since we only access it
  // from getArticleComments.
  // It's my responsibility to synchronize the tables somewhere else so this should always assume good input.
  const { data } = (await Requests.get<CommentModel>(`${STRAPI_INSTANCE_URL}/comments/${id}`)) as Requests.NotUndefinedResponse;
  return data;
}

/*
  NOTE(jerry):
    It appears heavily nested things do not show up and we have to fetch them ourselves... Not a big deal I suppose.

  I'll just a do a slow one by one fetch.
*/
async function sanitizeComments(comments: CommentModel[]) {
  return await Promise.all(
    comments.map(
      async function (comment) {
        // @ts-expect-error
        const user = await getUserById(comment.user?.id);

        const sanitized = {
          ...comment,
          user: {
        // @ts-expect-error
            avatar: user?.avatar || "https://lh6.googleusercontent.com/-f9MhM40YFzc/AAAAAAAAAAI/AAAAAAABjbo/iG_SORRy0I4/photo.jpg",
            name:   user?.username || "Anonymous",
          }
        };

        return sanitized;
      }
  ));
}

export async function getArticleComments(name: string): Promise<CommentModel[]> {
  const article = await getArticle(name);
  const commentPromises = article.comments.map(({id}) => getCommentById(id));
  const fullComments    = await Promise.all(commentPromises);

  return sanitizeComments(fullComments);
}

export async function getVotesOfArticle(name: string): Promise<VoteModel[]> {
  const article = await getArticle(name);
  return article.votes.map((vote) => { return { user: vote.user, type: vote.type } });
}

// TODO(jerry): no user association yet.
export async function addArticleComment(articleName: string, comment: CommentModel) {
  const response = await Requests.put_safe(
    `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}/add_comment/`,
    {},
    {
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user,
      votes: [],
    }
  );
}

export async function getArticles() {
  const { data } = await Requests.get_safe<ArticleModel[]>(`${STRAPI_INSTANCE_URL}/articles`, []);
  // I promise :)
  // NOTE(jerry):
  // tags are stored differently here. We sanitize it afterwards.
  const articles = data;

  const result = articles.map((article) => ({
    ...article,
    //@ts-ignore
    // This isn't really true,
    // but I don't really want to add additional typing because
    // I know what I'm supposed to be seeing...
    tags: (article.tags).map(({name}) => name),
    id: validPageLink(article.name),
  }));

  return result;
}
export async function getRecycledArticles() {
  const { data } = await Requests.get_safe<ArticleModel[]>(`${STRAPI_INSTANCE_URL}/recycled_articles`, []);
  const articles = data;

  const result = articles.map((article) => ({
    ...article,
    //@ts-ignore
    tags: (article.tags).map(({name}) => name),
    id: validPageLink(article.name),
  }));

  return result;
}

// Might as well take a user and retrieve the access token like I do in articleVote
// which would be more convenient!
export async function insertArticle(article: ArticleModel, accessToken: string) {
  const accessHeader = { Authorization: `Bearer ${accessToken}` };
  try {
    const response = await Requests.post(
      `${STRAPI_INSTANCE_URL}/articles`,
      {
        name: article.name,
        content: article.content,
        createdAt: article.createdAt,
        comments: [],
        tags: [],
      },
      { headers: accessHeader }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function deleteArticle(articleName: string, accessToken: string) {
  const accessHeader = { Authorization: `Bearer ${accessToken}` };
  try {
    // lmao reserved keywords
    const response = await Requests._delete(
      `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}`,
      { headers: accessHeader }
    );
  } catch (error) {
    console.error(error);
  }
}

// This is duped from another file. Need to think of better way to organize, since I want to
// keep most stuff here for now.
export async function commentVote(userInformation: User, commentId: number, voteCommand: string) {
  if (userInformation) {
    const requestCommand = {
      user: userInformation,
      type: voteCommand,
    };

    await Requests.put(
      `${STRAPI_INSTANCE_URL}/comments/${commentId}/vote`,
      requestCommand,
      {
        headers: { Authorization: `Bearer ${userInformation.accessToken}` }
      }
    );
  }
}
export async function articleVote(userInformation: User, articleName: string, voteCommand: string) {
  if (userInformation) {
    const requestCommand = {
      user: userInformation,
      type: voteCommand,
    };

    await Requests.put(
      `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}/vote`,
      requestCommand,
      {
        headers: { Authorization: `Bearer ${userInformation.accessToken}` }
      }
    );
  }
}

// NOTE(jerry):
// quickly just made to be identical to getArticles since it's
// the same but with less fields.
export async function getArticleLinks() {
  return (await getArticles()) as ArticleLink[];
}
export async function getRecycledArticleLinks() {
  return (await getRecycledArticles()) as ArticleLink[];
}

// TODO(jerry):
// not sure whether this is really a privacy / security hole...
// Should probably just always ask for authentication
// IE: we only give this information to people who are actually visiting
// the website (ship a token on visit, in order to prevent scrapers or whatever
// from getting information. Not perfect, but it's one more layer to go through...)
type Optional<T> = T | undefined | null;
export async function getUserById(id?: number): Promise<Optional<User>> {
  if (id) {
    try {
      const { data } = await Requests.get<User>(`${STRAPI_INSTANCE_URL}/users/${id}`);
      return data;
    } catch (error) {
      return undefined;
    }
  }
}

/*
  We should only include tags that actually get used, however because the tags
  are interned we have to handle this a bit differently.

  Probably just make the tags get "reference counted", with any tag updates to articles
  affecting the collection.

  Tags may never be deleted, but that might be okay since they're just basically single strings
  with a number.
*/
export async function getArticleTags() {
  const {data} = await Requests.get_safe<{name: string}[]>(`${STRAPI_INSTANCE_URL}/tags`, []);
  const allTags = data.map(({name}) => name);

  /*
    is basically the idea.

    return allTags.filter(({references} => references > 0));
  */
  return allTags;
}
// NOTE(jerry): Not included in strapi test!
export async function getRecycleBinArticles() {
  const recyleBinArticles : RecycleBinArticleModel[] = [];

  return recyleBinArticles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}

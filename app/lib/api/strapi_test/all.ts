import * as Requests from 'lib/requests';

// When we get real deployment make this an environment variable.
const STRAPI_INSTANCE_URL = "http://localhost:1337";

import { CommentModel, RecycleBinArticleModel, VoteModel, VoteType } from 'lib/models';
import { validPageLink } from 'lib/functions';
import { ArticleModel } from 'lib/models';
import { User } from "state/strapi_test/admin";

export type ArticleLink = Pick<ArticleModel, 'name' | 'draftStatus' | 'tags'>;

export async function getArticle(name: string) {
  const { data } = await Requests.get_safe<ArticleModel>( `${STRAPI_INSTANCE_URL}/articles/by_name/${name}`, ArticleModel.default);
  return data;
}

export async function getArticleComments(name: string): Promise<CommentModel[]> {
  const article = await getArticle(name);
  return article.comments;
}

export async function getVotesOfArticle(name: string): Promise<VoteModel[]> {
  const article = await getArticle(name);
  console.log("article", article);
  return article.votes.map((vote) => { return { userId: vote.user, type: vote.type } });
}

// TODO(jerry): no user association yet.
export async function addArticleComment(articleName: string, comment: CommentModel) {
  console.log("add comment!");
  const response = await Requests.put_safe(
    `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}/add_comment/`,
    {},
    {
      content: comment.content,
      createdAt: comment.createdAt,
      votes: [],
    }
  );

  console.log(response);
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

  console.log(result);

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
        createdAt: article.dateCreated,
        comments: [],
        tags: [],
      },
      { headers: accessHeader }
    );
    console.log("insert response: ", response);
  } catch (error) {
    console.error(error);
  }
}

// This is duped from another file. Need to think of better way to organize, since I want to
// keep most stuff here for now.
export async function articleVote(userInformation: User, articleName: string, voteCommand: string) {
  console.log(userInformation);
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
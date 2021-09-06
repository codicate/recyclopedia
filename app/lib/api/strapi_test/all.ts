import axios from 'axios';

// When we get real deployment make this an environment variable.
const STRAPI_INSTANCE_URL = "http://localhost:1337";

import { CommentModel, RecycleBinArticleModel } from 'lib/models';
import { validPageLink } from 'lib/functions';
import { ArticleModel } from 'lib/models';

export type ArticleLink = Pick<ArticleModel, 'name' | 'draftStatus' | 'tags'>;

// No exceptions to handle failure cases! Do be careful!

export async function getArticle(name: string) {
  const {data} = await axios.get(`${STRAPI_INSTANCE_URL}/articles/by_name/${name}`);
  return data as ArticleModel;
}

export async function getArticleComments(name: string): Promise<CommentModel[]> {
  const article = await getArticle(name);
  return article.comments;
}

// TODO(jerry): no user association yet.
export async function addArticleComment(articleName: string, comment: CommentModel) {
  console.log("add comment!");
  const response = await axios.put(
    `${STRAPI_INSTANCE_URL}/articles/by_name/${articleName}/add_comment/`,
    {
      content: comment.content,
      createdAt: comment.createdAt,
      votes: [],
    }
  );

  console.log(response);
}

export async function getArticles() {
  const {data}   = await axios.get(`${STRAPI_INSTANCE_URL}/articles`);
  // I promise :)
  const articles = data as ArticleModel[];

  return articles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}

// NOTE(jerry):
// quickly just made to be identical to getArticles since it's
// the same but with less fields.
export async function getArticleLinks() {
  return (await getArticles()) as ArticleLink[];
}

// NOTE(jerry): Not included in strapi test!
export async function getArticleTags() {
  return ([] as string[]);
}
// NOTE(jerry): Not included in strapi test!
export async function getRecycleBinArticles() {
  const recyleBinArticles : RecycleBinArticleModel[] = [];

  return recyleBinArticles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}
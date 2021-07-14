import axios, { AxiosResponse } from 'axios';

import { generateAuthHeader, REALM_GRAPHQL_ENDPOINT } from 'lib/utils/realmClient';
import { validPageLink } from 'lib/functions';
import { ArticleModel } from 'lib/models';


const getAllArticlesQuery = `
{
  articles {
    name
    content
    draftStatus
    bannerImage
    dateCreated
    dateModified
    votes {
      type
      userId
    }
    tags
  }
}
`;

interface GetAllArticlesModel {
  data: {
    articles: ArticleModel[];
  };
}

export async function getAllArticles() {
  const res: AxiosResponse<GetAllArticlesModel> = await axios({
    method: 'post',
    url: REALM_GRAPHQL_ENDPOINT,
    headers: await generateAuthHeader(),
    data: {
      query: getAllArticlesQuery
    }
  });

  const articles = res.data.data.articles;

  return articles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}
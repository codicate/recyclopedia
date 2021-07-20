import axios, { AxiosResponse } from 'axios';

import { generateAuthHeader, REALM_GRAPHQL_ENDPOINT } from 'lib/utils/realmClient';
import { validPageLink } from 'lib/functions';
import { ArticleModel } from 'lib/models';


const getArticlesQuery = `
{
  articles {
    name
    content
    draftStatus
    bannerImage
    dateCreated
    dateModified
    tags
    votes {
      type
      userId
    }
    comments {
      content
      createdAt
      user {
        avatar
        name
      }
      votes {
        type
        userId
      }
    }
  }
}
`;

interface getArticlesModel {
  data: {
    articles: ArticleModel[];
  };
}

async function getArticles() {
  const res: AxiosResponse<getArticlesModel> = await axios({
    method: 'post',
    url: REALM_GRAPHQL_ENDPOINT,
    headers: await generateAuthHeader(),
    data: {
      query: getArticlesQuery
    }
  });

  const articles = res.data.data.articles;

  return articles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}

export default getArticles;
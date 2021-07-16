import axios, { AxiosResponse } from 'axios';

import { generateAuthHeader, REALM_GRAPHQL_ENDPOINT } from 'lib/utils/realmClient';
import { validPageLink } from 'lib/functions';
import { RecycleBinArticleModel } from 'lib/models';


const getRecycleBinArticlesQuery = `
{
  recycleBinArticles {
    name
    content
    draftStatus
    bannerImage
    dateCreated
    dateModified
    pendingDaysUntilDeletion
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

interface GetRecycleBinArticlesModel {
  data: {
    recycleBinArticles: RecycleBinArticleModel[];
  };
}

async function getRecycleBinArticles() {
  const res: AxiosResponse<GetRecycleBinArticlesModel> = await axios({
    method: 'post',
    url: REALM_GRAPHQL_ENDPOINT,
    headers: await generateAuthHeader(),
    data: {
      query: getRecycleBinArticlesQuery
    }
  });

  const recyleBinArticles = res.data.data.recycleBinArticles;

  return recyleBinArticles.map((article) => ({
    id: validPageLink(article.name),
    ...article
  }));
}

export default getRecycleBinArticles;
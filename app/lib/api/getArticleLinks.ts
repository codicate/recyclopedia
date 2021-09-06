import axios, { AxiosResponse } from 'axios';

import { generateAuthHeader, REALM_GRAPHQL_ENDPOINT } from 'utils/realmClient';
import { ArticleModel } from 'lib/models';


const getArticleLinksQuery = `
{
  articles {
    name
    draftStatus
    tags
  }
}
`;

export type ArticleLink = Pick<ArticleModel, 'name' | 'draftStatus' | 'tags'>;

interface GetArticleLinksModel {
  data: {
    articles: ArticleLink[];
  };
}

async function getArticleLinks() {
  const res: AxiosResponse<GetArticleLinksModel> = await axios({
    method: 'post',
    url: REALM_GRAPHQL_ENDPOINT,
    headers: await generateAuthHeader(),
    data: {
      query: getArticleLinksQuery
    }
  });

  const articleLinks = res.data.data.articles;
  return articleLinks;
}

export default getArticleLinks;
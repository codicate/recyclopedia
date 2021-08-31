import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';

import TokensCasher from 'utils/tokensCacher';
import { ArticleModel } from 'lib/models';
// import getArticles from 'api/getArticles';
import {
  getArticles
} from 'api/strapi_test/all';

import Article from 'components/Article/Article';


type ContextParams = { id: string; };
type QueriedArticleToken = ArticleModel & ContextParams;

interface PageProps {
  article: QueriedArticleToken;
};

const Articles = ({ article }: PageProps) => (
  <>
    <Head>
      <title>{article.name}</title>
    </Head>
    <Article article={article} inRecycling={false} />
  </>
);

const tokensCasher = new TokensCasher<QueriedArticleToken>('article');

// NOTE(jerry):
// just from observing the stuff it looks id is just the name encoded as a validPageLink
import {validPageLink} from 'lib/functions';

export const getStaticPaths: GetStaticPaths = async () => {
  const tokens = (await getArticles()).map(
    (original) => {return {... original, id: validPageLink(original.name)}}
  );
  tokensCasher.cacheTokens(tokens);

  const paths = tokens.map((token) => ({
    params: {
      id: token.id
    }
  }));

  console.log(paths);

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<PageProps, ContextParams> = async ({ params }) => {
  if (params?.id) {
    const token = tokensCasher.retrieveToken(params.id);

    return {
      props: {
        article: token
      }
    };
  };

  return {
    notFound: true
  };
};

export default Articles;

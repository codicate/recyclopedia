import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';

import TokensCasher from 'lib/utils/tokensCacher';
import { ArticleModel } from 'lib/models';
import getArticles from 'lib/api/getArticles';

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

export default Articles;


const tokensCasher = new TokensCasher<QueriedArticleToken>('article');

export const getStaticPaths: GetStaticPaths = async () => {
  const tokens = await getArticles();
  tokensCasher.cacheTokens(tokens);

  const paths = tokens.map((token) => ({
    params: {
      id: token.id
    }
  }));

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
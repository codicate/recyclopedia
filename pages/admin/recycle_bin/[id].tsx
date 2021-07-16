import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';

import TokensCasher from 'lib/utils/tokensCacher';
import { RecycleBinArticleModel } from 'lib/models';
import getRecyleBinArticles from 'lib/api/getRecyleBinArticles';

import Article from 'components/Article/Article';


type ContextParams = { id: string; };
type QueriedArticleToken = RecycleBinArticleModel & ContextParams;

interface PageProps {
  article: QueriedArticleToken;
};


const Articles = ({ article }: PageProps) => (
  <>
    <Head>
      <title>(Deleted) {article.name}</title>
    </Head>
    <Article article={article} inRecycling={true} />
  </>
);

export default Articles;


const tokensCasher = new TokensCasher<QueriedArticleToken>('recycleBinArticle');

export const getStaticPaths: GetStaticPaths = async () => {
  const tokens = await getRecyleBinArticles();
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
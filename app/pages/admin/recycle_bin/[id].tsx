/*
  NOTE/TODO(jerry):

    This is exactly identical to the other [id].tsx, mostly cause these
    files do the exact same thing except for being that they fetch from slightly
    different URLs.
*/

import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RecycleBinArticleModel, ArticleModel } from 'lib/models';
import {
  getRecycledArticle,
  getRecycledArticleLinks,
} from 'api/strapi_test/all';

import Article from 'components/Article/Article';
import {validPageLink} from 'lib/functions';

type ContextParams = { 
  id: string;
  articleName: string;
};
interface PageProps {
  article: ArticleModel;
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


export const getStaticPaths: GetStaticPaths = async () => {
  const articleLinks = await getRecycledArticleLinks();
  const paths = articleLinks.map((link) => ({
    params: {
      id: validPageLink(link.name),
    }
  }));

  return {
    paths,
    fallback: true
  };
};


export const getStaticProps: GetStaticProps<PageProps, ContextParams> = async ({ params }) => {
  if (params?.id) {
    const article = await getRecycledArticle(params.id);

    return {
      props: {
        article
      },
      revalidate: 5
    };
  }

  return {
    notFound: true
  }
};
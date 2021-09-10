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
      },
      /*
        NOTE(jerry):
          As there seems to be no finer grain control (which is understandable as that's a more
          specific case to handle) over the page regeneration.

          I'm not going to lose much sleep over just defining this to be about 5 seconds. It's fast enough,
          without triggering so many rebuilds. It shouldn't be ultra noticable.

          We can just shim the preview anyways for editing mode (if you can use the editor... You have javascript,
          and we don't need to source the data from the server anymore as long as you're editing since you have the most "recent"
          version. Concurrent editors are a whole different issue and I'm not aware of anyone who actually cares or knows how to
          do it correctly, so we won't do it either.)
      */
      revalidate: 5
    };
  };

  return {
    notFound: true
  };
};

export default Articles;

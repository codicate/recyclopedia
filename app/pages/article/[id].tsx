import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import { ArticleModel } from 'lib/models';
import {
  getArticle,
  getArticleLinks,
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

function Articles({ article }: PageProps) {
  if (article) {
    return (
      <>
        <Head>
          <title>{article.name}</title>
        </Head>
        <Article article={article} inRecycling={false} />
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>Article Not Found!</title>
        </Head>
        <p>For some reason... We couldn&apos;t find this page?</p>
      </>
    );
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articleLinks = await getArticleLinks();
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
    const article = await getArticle(params.id);

    return {
      props: {
        article
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
  }

  return {
    notFound: true
  }
};

export default Articles;

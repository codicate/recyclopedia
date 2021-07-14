import { GetStaticProps } from 'next';

import Article from 'components/Article/Article';


export const getStaticProps: GetStaticProps = async (ctx) => {
  const res = await fetch(`https://.../data`);
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data }, // will be passed to the page component as props
  };
};

const Articles = () => {
  return (
    <Article article={ } inRecycling={false} />
  );
};

export default Article;
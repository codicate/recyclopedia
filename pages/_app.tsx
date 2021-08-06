import 'styles/globals.scss';
import { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Secrets from 'secrets';

import { wrapper } from 'state/store';
import { useAppDispatch } from 'state/hooks';
import { initApi } from 'state/articles';

import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";


function App({ Component, pageProps }: AppProps) {
  console.log('ff', wrapper)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initApi(Secrets.RECYCLOPEDIA_APPLICATION_ID));
  }, [dispatch]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />

        <title>Recyclopedia</title>
        <meta
          name="description"
          content="Recyclopedia is a wiki where people can browse and write recyling articles"
        />
        <meta
          name="keywords"
          content="The Environment Project, Project Environment, projectenv, environment, recycling, green, RRR"
        />
      </Head>
      <Header />
      <main id='main'>
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}

export default wrapper.withRedux(App);

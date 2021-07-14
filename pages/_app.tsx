import 'styles/globals.scss';
import { useState } from "react";
import { AppProps } from 'next/app';
import Head from 'next/head';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from 'lib/global/store';

import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";


const withRedux = <
  T extends Record<string, unknown>
>(
  App: (props: T) => JSX.Element
) => (props: T) => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App {...props} />
    </PersistGate>
  </Provider>
);

function App({ Component, pageProps }: AppProps) {
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

export default withRedux(App);

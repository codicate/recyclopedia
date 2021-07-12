import 'styles/globals.scss';
import { AppProps } from 'next/app';
import Head from 'next/head';

import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from 'app/store';

import Header from "pages/Header/Header";
import Footer from "pages/Footer/Footer";


const withRedux = <
  T extends Record<string, unknown>
>(
  Component: React.ComponentType<T>
) => (props: T) => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <Component {...props} />
    </PersistGate>
  </Provider>
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
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
      <BrowserRouter>
        <Header />
        <main id='main'>
          <Component {...pageProps} />
        </main>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default withRedux(MyApp);

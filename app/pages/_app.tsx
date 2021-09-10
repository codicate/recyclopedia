import 'styles/globals.scss';
import { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Secrets from 'secrets';

import { wrapper } from 'state/store';
import { useAppDispatch } from 'state/hooks';
import { initApi } from 'state/strapi_test/articles';

import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import * as Requests from 'lib/requests';

// Keep this as the only place Axios *must* be exposed.
function AsynchronousAxiosResponseWait<responseType>(axiosPromise: any): Promise<Requests.Response<responseType>> {
  return new Promise(
    function (resolve, reject) {
      try {
        axiosPromise.then(
          // @ts-ignore
          function (response) {
            resolve({
              status: response.status,
              data: response.data,
              headers: response.headers,
            });
          }
        )
      } catch (error) {
        reject(error);
      }
    }
  )
}
// TODO(jerry): delete method.
Requests.provideImplementation(
  {
    async get<responseType>(url: string, config?: Requests.RequestConfiguration): Promise<Requests.Response<responseType>> {
      const promise = axios.get(url, config as AxiosRequestConfig);
      return AsynchronousAxiosResponseWait<responseType>(promise);
    },
    async delete<responseType>(url: string, config?: Requests.RequestConfiguration): Promise<Requests.Response<responseType>> {
      const promise = axios.delete(url, config as AxiosRequestConfig);
      return AsynchronousAxiosResponseWait<responseType>(promise);
    },
    async post<responseType, dataType>(url: string, data: dataType, config?: Requests.RequestConfiguration): Promise<Requests.Response<responseType>> {
      const promise = axios.post(url, data, config as AxiosRequestConfig);
      return AsynchronousAxiosResponseWait<responseType>(promise);
    },
    async put<responseType, dataType>(url: string, data: dataType, config?: Requests.RequestConfiguration): Promise<Requests.Response<responseType>> {
      const promise = axios.put(url, data, config as AxiosRequestConfig);
      return AsynchronousAxiosResponseWait<responseType>(promise);
    }
  }
);

function App({ Component, pageProps }: AppProps) {
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

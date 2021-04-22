import reportWebVitals from 'reportWebVitals';

import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

import 'index.css';
import 'styles/global.scss';

import * as Realm from "realm-web";
import { Secrets } from 'secrets';

import App from 'App';

class RecyclopediaApplicationContext {
  constructor(appId, onFinishedLoadFn) {
    const recyclopediaAnonymousCredentials = Realm.Credentials.anonymous();

    this.application = new Realm.App({ id: appId });
    this.applicationUser = undefined;

    (async function () {
      try {
        const result = await this.application.logIn(recyclopediaAnonymousCredentials);
        this.applicationUser = result;
      } catch (error) {
        console.error("Failed to login because: ", error);
      }

      onFinishedLoadFn.bind(this)();
    }).bind(this)();
  }

  queryForArticles(query) {
    // I should "lazy-init" login this
    // however I forced a buffer load, before anything happens
    // so I am guaranteed to have a user unless we couldn't login for some reason.
    if (this.applicationUser) {
      return (async function () {
        if (query) {
          return await this.applicationUser.functions.getAllArticles(query);
        } else {
          return await this.applicationUser.functions.getAllArticles();
        }
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }

    return undefined;
  }

  deleteArticle(name) {
    if (this.applicationUser) {
      (async function () {
        this.applicationUser.functions.removeArticle(name);
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }
  }

  insertArticle(articleContents) {
    if (this.applicationUser) {
      (async function () {
        await this.applicationUser.functions.createOrUpdateArticle(articleContents);
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }

    return undefined;
  }
}

/*
  This weird wrapping mess is kind of necessary as the connection to mongodb realm/atlas
  takes a noticable amount of time. I'm not entirely convinced it's cause of how I set it up
  considering it's like two documents or something...

  Something to put into consideration though.
*/
(async function () {
  new RecyclopediaApplicationContext(
    Secrets.RECYCLOPEDIA_APPLICATION_ID,
    function () {
      ReactDOM.render(
        <React.StrictMode>
          <BrowserRouter basename='/recyclopedia'>
            <App api={this} />
          </BrowserRouter>
        </React.StrictMode>,
        document.getElementById('root')
      );

      reportWebVitals();
    });

  ReactDOM.render(
    <React.StrictMode>
      <p>Please wait! Loading Recyclopedia...</p>
    </React.StrictMode>,
    document.getElementById('root')
  );
})();

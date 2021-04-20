import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'index.css';
import App from 'App';
import reportWebVitals from 'reportWebVitals';

import {Secrets} from 'secrets';

import * as Realm from "realm-web";

class RecyclopediaApplicationContext {
    constructor(appId, onFinishedLoadFn) {
        const recyclopediaAnonymousCredentials = Realm.Credentials.anonymous();

        this.application = new Realm.App({ id: appId });
        this.applicationUser = undefined;

        (async function() {
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
            return (async function() {
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

    insertArticle(articleContents) {
        if (this.applicationUser) {
            (async function() {
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
(async function() {
    let recyclopedia_application = new RecyclopediaApplicationContext(
        Secrets.RECYCLOPEDIA_APPLICATION_ID,
        function() {
            ReactDOM.render(
                <React.StrictMode>
                  <BrowserRouter>
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

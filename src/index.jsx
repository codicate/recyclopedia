import reportWebVitals from 'reportWebVitals';

import approximateSearch from 'utils/search';

import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

import 'index.css';
import 'styles/global.scss';

import { Secrets } from 'secrets';
import {RecyclopediaApplicationContext} from 'utils/RecyclopediaApplicationContext';

import App from 'App';



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
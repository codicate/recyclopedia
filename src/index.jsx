import 'index.css';
import 'styles/global.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'app/store';

import App from 'App';


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename='/recyclopedia'>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


/*
  This weird wrapping mess is kind of necessary as the connection to mongodb realm/atlas
  takes a noticable amount of time. I'm not entirely convinced it's cause of how I set it up
  considering it's like two documents or something...

  Something to put into consideration though.
*/
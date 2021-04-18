import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import 'index.css';
import 'styles/global.scss'
import reportWebVitals from 'reportWebVitals';

import App from 'App';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename='/recyclopedia'>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();

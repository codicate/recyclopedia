import { Route, Switch, Link } from 'react-router-dom';
import globalArticlesData from 'data/articles.json';

import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage";
import Admin from "pages/Admin/Admin";
import { useState } from 'react';

function App() {
  const [articlesData, setArticlesData] = useState(globalArticlesData);
  return (
    <>
      <h1>
        <Link to="/">Recyclopedia</Link>
        <br />
        <Link to="/admin">Admin</Link>
      </h1>
      <Switch>
        <Route exact path='/'>
          <Homepage articlesData={articlesData} />
        </Route>
        <Route exact path='/admin'>
          <Admin articlesData={articlesData} setArticlesData={setArticlesData}/>
        </Route>
        {articlesData["articles"].map(buildFromJSON)}
      </Switch>
    </>
  );
}

export default App;

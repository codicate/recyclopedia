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
        <Link to="/recyclopedia/">Recyclopedia</Link>
        <br />
        <Link to="/recyclopedia/admin">Admin</Link>
      </h1>
      <Switch>
        <Route exact path='/recyclopedia/'>
          <Homepage articlesData={articlesData} />
        </Route>
        <Route exact path='/recyclopedia/admin'>
          <Admin articlesData={articlesData} setArticlesData={setArticlesData} />
        </Route>
        {articlesData["articles"].map(buildFromJSON)}
      </Switch>
    </>
  );
}

export default App;

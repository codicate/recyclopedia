import { Route, Switch, Link } from 'react-router-dom';
import articlesData from 'data/articles.json';

import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage";

function App() {
  return (
    <>
      <h1>
        <Link to="/">Recyclopedia</Link>
      </h1>
      <Switch>
        <Route exact path='/'>
          <Homepage articlesData={articlesData} />
        </Route>
        {articlesData["articles"].map(buildFromJSON)}
      </Switch>
    </>
  );
}

export default App;

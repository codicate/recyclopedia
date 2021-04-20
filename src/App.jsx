import { useEffect, useState } from 'react';
import { Route, Switch, Link } from 'react-router-dom';

import styles from 'App.module.scss';
import globalArticlesData from 'data/articles.json';
import { buildFromJSON } from "components/Article/Article";
import Homepage from "pages/Homepage/Homepage";
import Admin from "pages/Admin/Admin";

function App({api}) {
    const [articlesData, setArticlesData] = useState(globalArticlesData);

    useEffect(function() {
        (async function() {setArticlesData(await api.queryForArticles());})();
    }, []);

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
              <Admin api={api}
                     articlesData={articlesData}
                     setArticlesData={setArticlesData} />
            </Route>
            {articlesData["articles"].map(buildFromJSON)}
          </Switch>
        </>
    );
}

export default App;

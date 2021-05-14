import { Link } from 'react-router-dom';
import { MarkdownRender } from 'components/Article/RenderMarkdown.jsx';

import { validPageLink } from 'utils/functions';
import styles from 'pages/Homepage/Homepage.module.scss';
import Searchbar from 'components/Searchbar/Searchbar';
import approximateSearch from 'utils/search';
import { useState, useContext } from 'react';
import { ApplicationContext } from 'App';

function Homepage({ api, setArticlesData, articlesData }) {
    const [searchResult, setSearchResult] = useState([]);
    const context = useContext(ApplicationContext);

    const search = (input) => {
        setSearchResult(
          (input) ? approximateSearch(
            articlesData.articles.map((article) => article),
            input
          ) : []
        );
    };

    return (
        <>
          <h1>Welcome to Recyclopedia</h1>
          <Searchbar returnInput={search} />
          {
              searchResult.map(({name, content}) => (
                  <Link to={validPageLink(name)}>
                    <u><p>{name}</p></u>
                    <MarkdownRender className={styles.searchResult}>
                    {`${content.substr(0, 100).replaceAll(/\\n/g, ' ')}...`}
                    </MarkdownRender>
                  </Link>
              ))
          }
          <br/>
          {
              (context.isAdmin) ?
                  articlesData.articles.map(({ name, draftStatus }) => (
                      <p key={name} >
                        <Link to={validPageLink(name)}>
                          {(draftStatus) ? "[DRAFT*] "+ name : name}
                        </Link>
                      </p>
                  ))
                  :
                  // I should technically not check for undefined, but okay.
                  articlesData.articles
                  .filter(({ draftStatus }) => draftStatus === false || draftStatus === undefined)
                  .map(({ name }) => (
                      <p key={name} >
                        <Link to={validPageLink(name)}>
                          {name}
                        </Link>
                      </p>
                  ))
          }
          
        </>
    );
}

export default Homepage;

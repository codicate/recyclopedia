import styles from 'pages/Index/IndexPage.module.scss';
import { Link } from 'react-router-dom';
import { useState, } from 'react';

import { useAppSelector } from 'app/hooks';
import { selectArticlesData, selectAllTags } from 'app/articlesSlice';
import { LoginType, selectLoginType } from 'app/adminSlice';

import { validPageLink, dictionaryUpdateKey } from 'utils/functions';

interface TagFilter {
    filterName: string;
    active: boolean;
}

interface FilterSettings {
    draftStatus: boolean;
    tagFilters: TagFilter[];
}

interface IndexFilterProperties {
    filterSettings: FilterSettings;
}

function IndexFilter({filterSettings} : IndexFilterProperties) {
    return (<>
              <h2>Index Filtering</h2>
            </>);
}

function IndexPage() {
    const articlesData = useAppSelector(selectArticlesData);
    const allTags = useAppSelector(selectAllTags);

    const [filterSettings, updateFilterSettings] = useState(
        {
            draftStatus: false,
            tagFilters: allTags.map((tag) => { return {filterName: tag, active: false,}; })
        }
    );

    const currentLoginType = useAppSelector(selectLoginType);
    const isAdmin = currentLoginType === LoginType.Admin;

    return (
        <div className={styles.index}>
          <IndexFilter filterSettings={filterSettings}/>
          {allTags.map((tag) => <p>{tag}</p>)}
          {
              (isAdmin) ?
                  articlesData.articles.map(({ name, draftStatus }) => (
                      <p key={name} >
                        <Link to={validPageLink(name)}>
                          {(draftStatus) ? "[DRAFT*] " + name : name}
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
        </div>
    );
}

export default IndexPage;

import styles from 'pages/Index/IndexPage.module.scss';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
    updateFilters: {
        updateTagFilter: (id: string, newValue: boolean) => void,
    }
}

// I would've made a foldable component atm, but maybe I don't want it exactly
// identical, so I'll just replicate it for now since it's not very difficult
// to do it, and it'll be self-contained.
function IndexFilter({filterSettings, updateFilters} : IndexFilterProperties) {
    const [foldedStatus, updateFoldedStatus] = useState(false);
    
    return (<>
              <div id={styles.index_filter}>
                <h2>Index Filtering</h2>
                <button onClick={() => updateFoldedStatus(!foldedStatus)}>{(foldedStatus) ? '+' : '-'}</button>
                <hr/>
                {(!foldedStatus) ? (
                    <>
                      <h3>Tag Filters:</h3>
                      {
                          filterSettings.tagFilters.map(
                              ({filterName, active}) => (
                                  <div key={filterName}>
                                    <input type="checkbox"
                                           value={filterName}
                                           checked={active}
                                           onChange={
                                               function (event) {
                                                   updateFilters.updateTagFilter(filterName, event.target.checked);
                                               }
                                           }/>
                                    <label htmlFor={filterName}>{filterName}</label>
                                  </div>
                              )

                          )
                      }
                    </>
                ): <></>}
                <hr/>
              </div>
            </>);
}

function IndexPage() {
    const articlesData = useAppSelector(selectArticlesData);
    const allTags = useAppSelector(selectAllTags);
    const [filterSettings, updateFilterSettings] = useState({draftStatus: false, tagFilters: [] as TagFilter[]});

    useEffect(
        function() {
            updateFilterSettings(
                {
                    draftStatus: false,
                    tagFilters: allTags.map((tag) => { return {filterName: tag, active: false}; })
                }
            );
        },
        [allTags]);

    const currentLoginType = useAppSelector(selectLoginType);
    const isAdmin = currentLoginType === LoginType.Admin;

    return (
        <div className={styles.index}>
          <IndexFilter
            filterSettings={filterSettings}
            updateFilters={
                {
                    updateTagFilter: function(id: string, v: boolean) {
                        updateFilterSettings(
                            dictionaryUpdateKey(
                                filterSettings,
                                ["tagFilters"],
                                function (filterArray) {
                                    for (const filter of filterArray as TagFilter[]) {
                                        if (filter.filterName === id) {
                                            filter.active = v;
                                            break;
                                        }
                                    }
                                    return filterArray;
                                }
                            ) as FilterSettings
                        );
                    }
                }
            }/>
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

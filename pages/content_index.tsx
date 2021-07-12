import styles from "./content_index.module.scss";
import Link from 'next/Link';
import { useState, useEffect } from "react";

import { useAppSelector } from "app/hooks";
import { selectArticlesData, selectAllTags } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { validPageLink, dictionaryUpdateKey } from "utils/functions";

import Collapsible from "components/UI/Collapsible";
import CheckboxButton from "components/UI/CheckboxButton";

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
  };
}

function IndexFilter({ filterSettings, updateFilters }: IndexFilterProperties) {
  return (
    <Collapsible header='Tags'>
      <div id={styles.tagList}>
        {
          filterSettings.tagFilters.map(({ filterName, active }) =>
            <CheckboxButton
              styledAs='oval'
              key={filterName}
              name={filterName}
              checked={active}
              onCheck={(checked) =>
                updateFilters.updateTagFilter(filterName, checked)
              }
            >
              {filterName}
            </CheckboxButton>
          )
        }
      </div>
    </Collapsible>
  );
}

function IndexPage() {
  const articlesData = useAppSelector(selectArticlesData);
  const allTags = useAppSelector(selectAllTags);
  const [filterSettings, updateFilterSettings] = useState({ draftStatus: false, tagFilters: [] as TagFilter[] });

  useEffect(
    function () {
      updateFilterSettings(
        {
          draftStatus: false,
          tagFilters: allTags.map((tag) => { return { filterName: tag, active: false }; })
        }
      );
    },
    [allTags]);

  const currentLoginType = useAppSelector(selectLoginType);
  const isAdmin = currentLoginType === LoginType.Admin;

  return (
    <div className={styles.index}>
      <h2>Index Page</h2>
      <IndexFilter
        filterSettings={filterSettings}
        updateFilters={
          {
            updateTagFilter: function (id: string, v: boolean) {
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
        }
      />
      <div className={styles.articleLinks}>
        {
          ((isAdmin) ?
            articlesData.articles :
            articlesData.articles.filter(({ draftStatus }) => !draftStatus)).
            filter(function ({ tags }) {
              let result = function () {
                for (const tagFilter of filterSettings.tagFilters) {
                  if (tagFilter.active) return false;
                }
                return true;
              }();

              if (!result) {
                for (const tagFilter of filterSettings.tagFilters) {
                  if (tags) {
                    for (const tag of tags) {
                      if (tagFilter.filterName === tag) {
                        // babel can't do ||=????
                        result = result || tagFilter.active;
                      }
                    }
                  }
                }
              }

              return result;
            }).map(({ name, draftStatus }) => (
              <Link key={name} href={validPageLink(name)}>
                <a>
                  {(draftStatus) ? "[DRAFT*] " + name : name}
                </a>
              </Link>
            ))
        }
      </div>
    </div>
  );
}

export default IndexPage;

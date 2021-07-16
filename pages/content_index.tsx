import styles from "./content_index.module.scss";
import { useState, useEffect } from "react";
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useAppSelector } from "lib/global/hooks";
import { LoginType, selectLoginType } from "lib/global/adminSlice";

import { validPageLink, dictionaryUpdateKey } from "lib/functions";
import getArticleLinks, { ArticleLink } from "lib/api/getArticleLinks";
import getArticleTags from 'lib/api/getArticleTags';

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

interface PageProps {
  articleLinks: ArticleLink[];
  tags: string[];
};


const IndexFilter = ({
  filterSettings,
  updateFilters
}: {
  filterSettings: FilterSettings;
  updateFilters: (id: string, newValue: boolean) => void,
}) => (
  <Collapsible header='Tags'>
    <div id={styles.tagList}>
      {filterSettings.tagFilters.map(({ filterName, active }) =>
        <CheckboxButton
          styledAs='oval'
          key={filterName}
          name={filterName}
          checked={active}
          onCheck={(checked) =>
            updateFilters(filterName, checked)
          }
        >
          {filterName}
        </CheckboxButton>
      )}
    </div>
  </Collapsible>
);


function IndexPage({ articleLinks, tags }: PageProps) {
  const currentLoginType = useAppSelector(selectLoginType);
  const isAdmin = currentLoginType === LoginType.Admin;

  const [filterSettings, updateFilterSettings] = useState<FilterSettings>({
    draftStatus: false,
    tagFilters: []
  });

  useEffect(() => {
    updateFilterSettings({
      draftStatus: false,
      tagFilters: tags.map((tag) => ({
        filterName: tag,
        active: false
      }))
    });
  }, [tags]);

  return (
    <>
      <Head>
        <title>Content Index</title>
      </Head>
      <div className={styles.index}>
        <h2>Index Page</h2>
        <IndexFilter
          filterSettings={filterSettings}
          updateFilters={(id: string, v: boolean) =>
            updateFilterSettings(
              dictionaryUpdateKey(
                filterSettings,
                ["tagFilters"],
                (filterArray) => {
                  for (const filter of filterArray as TagFilter[]) {
                    if (filter.filterName === id) {
                      filter.active = v;
                      break;
                    }
                  }
                  return filterArray;
                }
              ) as FilterSettings
            )
          }
        />
        <div className={styles.articleLinks}>
          {((isAdmin)
            ? articleLinks
            : articleLinks.filter(({ draftStatus }) => !draftStatus)
          ).filter(({ tags }) => {
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
            <Link key={name} href={`/article/${validPageLink(name)}`}>
              <a>
                {(draftStatus) ? "[DRAFT*] " + name : name}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default IndexPage;


export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const articleLinks = await getArticleLinks();
  const tags = await getArticleTags();

  return {
    props: {
      articleLinks,
      tags
    }
  };
};
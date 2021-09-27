import styles from "./index.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";

import { GetStaticProps } from 'next';
import { useAppSelector, useAppDispatch } from "state/hooks";
import { selectArticlesData, deleteArticle, restoreArticle } from "state/strapi_test/articles";
import { LoginType, selectLoginType } from "state/strapi_test/admin";

import { validPageLink, dictionaryUpdateKey } from "lib/functions";
import Button from "components/UI/Button";

// NOTE(jerry):
// tags are not properly interned, so they are broken.
// That's okay I guess.
import {
  getRecycledArticleLinks,
  ArticleLink,
  getArticleTags
} from 'api/strapi_test/all';

interface PageProps {
  articleLinks: ArticleLink[];
  tags: string[];
};

// TODO(someone)

// little filler component as to not complict the RecyclingBin
type DaysLeft = {
  value: number,
};

function DaysLeft({ value }: DaysLeft) {
  const statusBg = {
    backgroundColor: function () {
      if (value <= 5) {
        return "red";
      } else if (value <= 15) {
        return "yellow";
      }
      return "transparent";
    }()
  };

  return (
    <>
      <span
        className={styles.daysLeft}
        style={statusBg}
      >
        {value} Days Left
      </span>
    </>
  );
}


// No admin check required. Things will already die here.
function RecyclingBin({ articleLinks, tags }) {
  const currentLoginType = useAppSelector(selectLoginType);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div id={styles.recyclingBin}>
      <h2>Welcome to the Recycling Bin</h2>
      <p>
        This is where articles go to die! If you&apos;ve accidently deleted an article. You can recover them here! Or you can dispose of them permenantly here!
      </p>

      {
        (articleLinks.length === 0) ? (
          <p id={styles.emptyMsg}>
            The Recycling Bin is Empty!
          </p>
        ) : (
          <div id={styles.recycledArticles}>
            { /*@ts-expect-error*/ }
            {articleLinks.map(({ name, daysUntilDeletion }) => (
              <div key={name}>
                <Link href={"/admin/recycle_bin" + validPageLink(name)}>
                  {name}
                </Link>
                <div>
                  <DaysLeft value={daysUntilDeletion} />
                  <Button
                    styledAs="oval"
                    onClick={async () => {
                      if (confirm("Do you want to restore this article?")) {
                        await dispatch(restoreArticle(name));
                        router.push(validPageLink(name));
                      }
                    }}
                  >
                    Restore
                  </Button>
                  <Button
                    styledAs="oval-danger"
                    onClick={() => {
                      if (confirm("Permenantly delete this article?")) {
                        dispatch(deleteArticle(name));
                        router.push("/");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>);
}

export default RecyclingBin;

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const articleLinks = await getRecycledArticleLinks();
  const tags = await getArticleTags();

  return {
    props: {
      articleLinks,
      tags
    },
    revalidate: 7,
  };
};
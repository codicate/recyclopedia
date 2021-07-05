import styles from "pages/RecyclingBin/RecyclingBinPage.module.scss";
import { Link, useHistory } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectArticlesData, deleteArticle, restoreArticle } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { validPageLink, dictionaryUpdateKey } from "utils/functions";
import Button from "components/UI/Button";


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
function RecyclingBin() {
  const articlesData = useAppSelector(selectArticlesData);
  const currentLoginType = useAppSelector(selectLoginType);
  const dispatch = useAppDispatch();
  const history = useHistory();

  return (
    <div id={styles.recyclingBin}>
      <h2>Welcome to the Recycling Bin</h2>
      <p>
        This is where articles go to die! If you&apos;ve accidently deleted an article. You can recover them here! Or you can dispose of them permenantly here!
      </p>

      {
        (articlesData.recycledArticles.length === 0) ? (
          <>
            <p id={styles.emptyMsg}>
              The Recycling Bin is Empty!
            </p>
          </>
        ) : (
          articlesData.recycledArticles.map(({ name, content, pendingDaysUntilDeletion }) => (
            <>
              <div key={name} >
                <Link to={"/admin/recycling_bin" + validPageLink(name)}>
                  {name}
                  <DaysLeft value={pendingDaysUntilDeletion} />
                </Link>
                <div>
                  <Button
                    styledAs="oval"
                    onClick={async () => {
                      if (confirm("Do you want to restore this article?")) {
                        await dispatch(restoreArticle(name));
                        history.push(validPageLink(name));
                      }
                    }}
                  >
                    Restore
                  </Button>
                  <Button
                    styledAs="oval"
                    onClick={() => {
                      if (confirm("Permenantly delete this article?")) {
                        dispatch(deleteArticle(name));
                        history.push("/");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          ))
        )
      }
    </div>);
}

export default RecyclingBin;

import styles from "pages/RecyclingBin/RecyclingBinPage.module.scss";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "components/UI/Button";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectArticlesData, deleteArticle } from "app/articlesSlice";
import { LoginType, selectLoginType } from "app/adminSlice";

import { validPageLink, dictionaryUpdateKey } from "utils/functions";
import CheckboxButton from "components/UI/CheckboxButton";

// little filler component as to not complict the RecyclingBin
type DaysLeft = {
  value: number,
};
function DaysLeft({value} : DaysLeft) {
  const inlineStyle = {
    backgroundColor: function() {
      if (value <= 5) {
        return "red";
      } else if (value <= 15) {
        return "yellow";
      }
      return "transparent";
    }(),
    marginLeft: "1em",
    fontSize: "1.2em",
    display: "inline-block",
    minWidth: "3em",
  };

  return (
    <>
      <span style={inlineStyle}>{value} Days Left</span>
    </>);
}

/*
    No admin check required. Things will already die here.
*/
function RecyclingBin() {
  const articlesData = useAppSelector(selectArticlesData);
  const currentLoginType = useAppSelector(selectLoginType);
  const dispatch = useAppDispatch();

  return (
    <div className={styles.index}>
      <h2>Welcome to the Recycling Bin</h2>
      <p>This is where articles go to die! If you&apos;ve accidently deleted
      an article. You can recover them here! Or you can dispose of them permenantly here!</p>

      {
        articlesData.articles
          .map(({ name, draftStatus }) => (
            <>
              <p key={name} >
                <Button
                  styledAs="oval"
                  onClick={
                    function() {
                      dispatch(deleteArticle(name));
                    }
                  }
                >Delete</Button>
                <Link to={"/admin/recycling_bin/" + validPageLink(name)}>
                  {name}
                  <DaysLeft value={15}/>
                </Link>
              </p>
            </>
          ))
      }
    </div>);
}

export default RecyclingBin;

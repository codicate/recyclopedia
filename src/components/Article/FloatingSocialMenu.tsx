import styles from "./FloatingSocialMenu.module.scss";
import { useState } from "react";

import MediaShareBtns from "./MediaShareBtns";
import CheckboxCounterBtn from "components/UI/CheckboxCounterBtn";
import Button from "components/UI/Button";


function FloatingSocialMenu({
  title,
  commentSectionRef,
  likeCount,
  dislikeCount
}: {
  title: string;
  commentSectionRef: React.RefObject<HTMLDivElement>;
  likeCount: number,
  dislikeCount: number,
}) {
  const [expandShare, setExpandShare] = useState(false);

  return (
    <div className={styles.floatingSocialMenu}>
      <CheckboxCounterBtn
        name='likes'
        materialIcon='thumb_up'
        info={likeCount.toString()}
      />
      <CheckboxCounterBtn
        name='dislikes'
        materialIcon='thumb_down'
        info={dislikeCount.toString()}
      />
      {(expandShare) && (
        <MediaShareBtns title={title} />
      )}
      <Button
        styledAs="circle"
        onClick={() => {
          const commentSection = commentSectionRef.current;
          if (!commentSection) return;

          const posY = commentSection.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: posY, behavior: "smooth" });
        }}
      >
        <span className='material-icons'>
          comment
        </span>
      </Button>
      <Button
        styledAs="circle"
        onClick={() => setExpandShare(!expandShare)}
      >
        <span className='material-icons'>
          {expandShare ? "close" : "share"}
        </span>
      </Button>
    </div >
  );
}

export default FloatingSocialMenu;

import styles from "./FloatingSocialMenu.module.scss";
import { useState } from "react";

import MediaShareBtns from "./MediaShareBtns";
import ButtonWithInfo from "components/UI/ButtonWithInfo";


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
      <ButtonWithInfo
        materialIcon='thumb_up'
        info={likeCount.toString()}
      />
      <ButtonWithInfo
        materialIcon='thumb_down'
        info={dislikeCount.toString()}
      />
      {(expandShare) && (
        <MediaShareBtns title={title} />
      )}
      <ButtonWithInfo
        materialIcon={(expandShare) ? "close" : "share"}
        onClick={() => setExpandShare(!expandShare)}
      />
      <ButtonWithInfo
        materialIcon="comment"
        onClick={() => {
          const commentSection = commentSectionRef.current;
          if (!commentSection) return;

          const posY = commentSection.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: posY, behavior: "smooth" });
        }}
      />
    </div >
  );
}

export default FloatingSocialMenu;

import styles from "./FloatingSocialMenu.module.scss";
import { useState, useRef } from "react";

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
  const likeBtnRef = useRef<HTMLInputElement>(null);
  const dislikeBtnRef = useRef<HTMLInputElement>(null);

  const handleVote = (
    e: React.FormEvent<HTMLInputElement>
  ) => {
    const likeBtn = likeBtnRef.current;
    const dislikeBtn = dislikeBtnRef.current;
    if (!likeBtn || !dislikeBtn) return;

    if ((e.target === likeBtn) && (likeBtn.checked)) {
      dislikeBtn.checked = false;
    }

    if ((e.target === dislikeBtn) && (dislikeBtn.checked)) {
      likeBtn.checked = false;
    }
  };

  return (
    <div className={styles.floatingSocialMenu}>
      <CheckboxCounterBtn
        ref={likeBtnRef}
        name='likes'
        materialIcon='thumb_up'
        counter={likeCount}
        onChange={(e) => {
          handleVote(e);
        }}
      />
      <CheckboxCounterBtn
        ref={dislikeBtnRef}
        name='dislikes'
        materialIcon='thumb_down'
        counter={dislikeCount}
        onChange={(e) => {
          handleVote(e);
        }}
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

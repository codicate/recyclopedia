import styles from "./FloatingSocialMenu.module.scss";
import { useState } from "react";

import { Vote, VoteType } from "app/articlesSlice";
import { currentVoteTypeOfCurrentUser, getLikeCountAndDislikeCount } from "components/Comment/Comment";

import MediaShareBtns from "./MediaShareBtns";
import CheckboxCounterBtn from "components/UI/CheckboxCounterBtn";
import Button from "components/UI/Button";


function FloatingSocialMenu({
  title,
  commentSectionRef,
  votes,
  vote,
}: {
  title: string;
  commentSectionRef: React.RefObject<HTMLDivElement>;
  votes: Vote[],
  vote: (vote: VoteType) => Promise<void>,
}) {
  const [expandShare, setExpandShare] = useState(false);
  const { likeCount, dislikeCount } = getLikeCountAndDislikeCount(votes);

  return (
    <div className={styles.floatingSocialMenu}>
      <CheckboxCounterBtn
        name='likes'
        materialIcon='thumb_up'
        counter={likeCount}
        checked={(() => currentVoteTypeOfCurrentUser(votes) === "like")()}
        onClick={() => (async () => { await vote(VoteType.Like); })()}
      />
      <CheckboxCounterBtn
        name='dislikes'
        materialIcon='thumb_down'
        counter={dislikeCount}
        checked={(() => currentVoteTypeOfCurrentUser(votes) === "dislike")()}
        onClick={() => (async () => { await vote(VoteType.Dislike); })()}
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

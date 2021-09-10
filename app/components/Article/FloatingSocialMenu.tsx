import styles from "./FloatingSocialMenu.module.scss";
import { useState } from "react";
import { VoteType, VoteModel, VoteTypeString } from 'lib/models';
import { useAppSelector } from "state/hooks";
// import { LoginType, selectLoginType } from "state/admin";
import { LoginType, selectLoginType, selectUserInformation } from "state/strapi_test/admin";
import { voteTypeByUserId, getLikeCountAndDislikeCount } from "components/Comment/Comment";

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
  votes: VoteModel[],
  vote: (vote: VoteType) => Promise<void>,
}) {
  const [expandShare, setExpandShare] = useState(false);
  const currentLoginType = useAppSelector(selectLoginType);
  const currentUser = useAppSelector(selectUserInformation);
  const [voteType, setVoteType] = useState<VoteTypeString>("none");

  const { likeCount, dislikeCount } =
    (currentLoginType !== LoginType.NotLoggedIn) ?
      getLikeCountAndDislikeCount(votes, { user: currentUser, vote: voteType }) :
      getLikeCountAndDislikeCount(votes);

  function confirmUserVoteType(type: VoteTypeString) {
    if (currentLoginType === LoginType.NotLoggedIn) {
      return false;
    }

    if (voteType === type) {
      return true;
    }

    return false;
  }
  function performVote(type: VoteTypeString) {
    if (voteType === type) {
      setVoteType("none");
    } else {
      setVoteType(type);
    }

    vote(VoteModel.fromString(type));
  }

  return (
    <div className={styles.floatingSocialMenu}>
      <CheckboxCounterBtn
        name='likes'
        materialIcon='thumb_up'
        counter={likeCount}
        checked={confirmUserVoteType("like")}
        onClick={() => (async () => { performVote("like") })()}
      />
      <CheckboxCounterBtn
        name='dislikes'
        materialIcon='thumb_down'
        counter={dislikeCount}
        checked={confirmUserVoteType("dislike")}
        onClick={() => (async () => { performVote("dislike") })()}
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

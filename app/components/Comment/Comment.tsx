import styles from "./Comment.module.scss";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";

import { useAppSelector } from "state/hooks";
import { LoginType, selectLoginType, selectUserInformation, User } from "state/strapi_test/admin";

import { VoteType, VoteModel, CommentModel, VoteTypeString } from 'lib/models';

import CheckboxButton from "components/UI/CheckboxButton";

export function voteTypeByUserId(votes: VoteModel[], userId: number) {
  if (!votes) {
    return "none";
  }

  // I really don't see why this can't just NOP when
  // the iterator is null/undefined?
  for (const vote of votes) {
    if (vote.user === userId) {
      return vote.type;
    }
  }
  return "none";
}

interface CurrentVoteInformation {
  user: User;
  vote: VoteTypeString;
}
export function getLikeCountAndDislikeCount(votes: VoteModel[], currentVoteInformation?: CurrentVoteInformation) {
  if (!votes) {
    return { likeCount: 0, dislikeCount: 0 };
  }

  let likeCount    = 0;
  let dislikeCount = 0;

  let countClientView = true;
  for (const vote of votes) {
    if (countClientView) {
      if (vote.user === currentVoteInformation?.user.id) {
        if (vote.type === currentVoteInformation.vote) {
          countClientView = false;
        } else {
          continue;
        }
      }
    }

    if (vote.type === "like") {
      likeCount += 1;
    } else if (vote.type === "dislike") {
      dislikeCount += 1;
    }
  }

  if (countClientView) {
    if (currentVoteInformation?.vote === "like") {
      likeCount += 1;
    } else if (currentVoteInformation?.vote === "dislike") {
      dislikeCount += 1;
    }
  }

  return { likeCount, dislikeCount };
}

export type ReplyCommentModel = CommentModel;
export interface TopLevelCommentModel extends CommentModel {
  replies: ReplyCommentModel[];
}

function Comment({
  comment,
  parentId,
  vote,
  /*
    When clicking on reply, and forming the message make a dispatch to
    
    replyToComment(articleName, parentId)

    This is not here, so an easier method would just be to pass in a submit comment
    function in the comment section to make things easier.
  */
  children
}: {
  vote: (vote: VoteType) => Promise<void>,
  comment: CommentModel;
  parentId?: number;
  children?: React.ReactChild | React.ReactChild[];
}) {
  const currentLoginType = useAppSelector(selectLoginType);
  const currentUser = useAppSelector(selectUserInformation);

  const {
    commenterAvatar,
    commenterUserName
  } = (comment.user) ? {
    commenterAvatar: "/public/images/vora-is-hot-af.png", 
    commenterUserName: comment.user.name,
  } : {
    // TODO find a better icon.
    commenterAvatar: "https://lh6.googleusercontent.com/-f9MhM40YFzc/AAAAAAAAAAI/AAAAAAABjbo/iG_SORRy0I4/photo.jpg",
    commenterUserName: "Anonymous",
  };

  const [voteType, setVoteType] = useState<VoteTypeString>("none");

  useEffect(
    function () {
      if (!comment.votes || currentLoginType === LoginType.NotLoggedIn) {
        return;
      }

      for (const vote of comment.votes) {
        if (vote.user === currentUser.id) {
          setVoteType(vote.type);
          break;
        }
      }
    },
    []
  );

  function confirmUserVoteType(type: VoteTypeString) {
    if (currentLoginType === LoginType.NotLoggedIn) {
      return false;
    }

    if (voteType === type) {
      return true;
    }
  }
  function performVote(type: VoteTypeString) {
    if (voteType === type) {
      setVoteType("none");
    } else {
      setVoteType(type);
    }

    vote(VoteModel.fromString(type));
  }

  /*
    Careful, I'm unaware of how correct the clientside predicting is... But it looks correct
    enough.
  */
  const { likeCount, dislikeCount } = 
  (currentLoginType !== LoginType.NotLoggedIn) ?
  getLikeCountAndDislikeCount(comment.votes, { user: currentUser, vote: voteType }) :
  getLikeCountAndDislikeCount(comment.votes);

  return (
    <div className={styles.comment}>
      <div className={styles.commentUser}>
        <Image
          className={styles.avatar}
          // src={commenterAvatar}
          // external image won't work, so this is a placeholder for images we will eventually store in imgBB or something
          src='/images/vora-is-hot-af.png'
          alt={commenterUserName}
          height={48}
          width={48}
        />
        <div>
          <p>{commenterUserName}</p>
          <p> {formatDistance(new Date(comment.createdAt), new Date())} ago </p>
        </div>
      </div>

      <div className={styles.commentContent}>
        {comment.content}
      </div>

      <div className={styles.commentControls}>
        <CheckboxButton
          name='like'
          styledAs='oval'
          className={styles.commentBtn}
          checked={confirmUserVoteType("like")}
          onClick={() => performVote("like")}>
          <span className='material-icons'>
            thumb_up
          </span>
          {likeCount}
        </CheckboxButton>
        <CheckboxButton
          name='dislike'
          styledAs='oval'
          className={styles.commentBtn}
          checked={confirmUserVoteType("dislike")}
          onClick={() => performVote("dislike")}
        >
          <span className='material-icons'>
            thumb_down
          </span>
          {dislikeCount}
        </CheckboxButton>
      </div >
      {children}
    </div >
  );
}

function TopLevelComment({
  comment,
  commentId,
  vote,
}: {
  comment: TopLevelCommentModel;
  commentId: number;
  vote: (vote: VoteType) => Promise<void>;
}) {
  return (<Comment comment={comment} vote={vote}/>);
}

export default TopLevelComment;

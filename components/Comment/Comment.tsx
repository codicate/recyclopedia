import styles from "./Comment.module.scss";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";

import { VoteType, VoteModel, CommentModel } from 'lib/models';
import { databaseApi } from "state/articles";

import CheckboxButton from "components/UI/CheckboxButton";

export function currentVoteTypeOfCurrentUser(votes: VoteModel[]) {
  // for (const vote of votes) {
  //   if (vote.userId === databaseApi.applicationUser?.id) {
  //     return vote.type;
  //   }
  // }
  return "none";
}

export function getLikeCountAndDislikeCount(votes: VoteModel[]) {
  if (!votes) {
    return { likeCount: 0, dislikeCount: 0 };
  }

  const likeCount = votes.reduce((total, { type }) =>
    total + ((type === "like") ? 1 : 0), 0);
  const dislikeCount = votes.reduce((total, { type }) =>
    total + ((type === "dislike") ? 1 : 0), 0);
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
  const {
    commenterAvatar,
    commenterUserName
  } = (comment.user) ? {
    commenterAvatar: comment.user.avatar,
    commenterUserName: comment.user.name,
  } : {
      // TODO find a better icon.
      commenterAvatar: "https://lh6.googleusercontent.com/-f9MhM40YFzc/AAAAAAAAAAI/AAAAAAABjbo/iG_SORRy0I4/photo.jpg",
      commenterUserName: "Anonymous",
    };

  const [voteType, setVoteType] = useState("none");

  useEffect(
    function () {
      // for (const vote of comment.votes) {
      //   if (vote.userId === databaseApi.applicationUser?.id) {
      //     setVoteType(vote.type);
      //     break;
      //   }
      // }
    },
    []
  );

  /*
    Careful, I'm unaware of how correct the clientside predicting is... But it looks correct
    enough.
  */
  const { likeCount, dislikeCount } = getLikeCountAndDislikeCount(comment.votes);
  console.log(comment);

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
          <p>
            {formatDistance(new Date(comment.createdAt), new Date())} ago
          </p>
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
          checked={
            function () {
              return currentVoteTypeOfCurrentUser(comment.votes) === "like" || voteType === "like";
            }()
          }
          onClick={() => (async () => {
            /*
            Vote(Type)
  
            if not voted:
              do the vote
  
            Vote(Type)
  
            if found_vote_type == type:
              unvote();
            else:
              unvote();
              vote(other_type)
            */

            // Since we're not doing replies
            // we don't need the full vote target so this should be fine I guess.
            if (voteType === "like") {
              setVoteType("none");
            } else {
              setVoteType("like");
            }
            await vote(VoteType.Like);
          })()}>
          <span className='material-icons'>
            thumb_up
          </span>
          {likeCount}
        </CheckboxButton>
        <CheckboxButton
          name='dislike'
          styledAs='oval'
          className={styles.commentBtn}
          checked={
            function () {
              return currentVoteTypeOfCurrentUser(comment.votes) === "dislike" || voteType === "dislike";
            }()
          }
          onClick={() => (async () => {
            if (voteType === "dislike") {
              setVoteType("none");
            } else {
              setVoteType("dislike");
            }
            await vote(VoteType.Dislike);
          })()}
        >
          <span className='material-icons'>
            thumb_down
          </span>
          {dislikeCount}
        </CheckboxButton>
        {/* <Button
          styledAs='oval'
          className={styles.commentBtn}
        >
          <span className='material-icons'>
            comment
          </span>
          Reply
        </Button> */}
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
  return (
    <Comment comment={comment} vote={vote}>
      {/* 
      Uncomment this for reply functionality.

      <>
        <br></br>
        {comment.replies.map((reply, index) =>
          <Comment key={index} parentId={commentId} comment={reply}></Comment>)}
      </> */}
    </Comment>
  );
}

export default TopLevelComment;
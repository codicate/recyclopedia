import styles from "./Comment.module.scss";
import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";

import { databaseApi, VoteType } from "app/articlesSlice";

import CheckboxButton from "components/UI/CheckboxButton";
import Button from "components/UI/Button";

export interface UserModel {
  name: string;
  avatar: string;
}

type MongoDBRealmUserIdType = string;
export interface Vote {
  userId: MongoDBRealmUserIdType;
  // MongoDB does not know about typescript types
  type: "like" | "dislike" | "none";
}

export interface CommentModel {
  user?: UserModel;
  content: string;
  createdAt: Date;
  votes: Vote[];
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
      for (const vote of comment.votes) {
        if (vote.userId === databaseApi.applicationUser?.id) {
          setVoteType(vote.type);
          break;
        }
      }
    },
    []
  );

  /*
    Careful, I'm unaware of how correct the clientside predicting is... But it looks correct
    enough.
  */
  const likeCount = comment.votes.reduce((total, { type }) =>
    total + ((type === "like") ? 1 : 0), 0);
  const dislikeCount = comment.votes.reduce((total, { type }) =>
    total + ((type === "dislike") ? 1 : 0), 0);

  return (
    <div className={styles.comment}>
      <div className={styles.commentUser}>
        <img src={commenterAvatar} alt={commenterUserName} />
        <div>
          <p>{commenterUserName}</p>
          <p>
            {formatDistance(comment.createdAt, new Date())} ago
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
              let result = false;
              for (const vote of comment.votes) {
                if (vote.userId === databaseApi.applicationUser?.id && vote.type === "like") {
                    result = true;
                    break;
                }
              }
              return result || (voteType === "like");
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
              let result = false;
              for (const vote of comment.votes) {
                if (vote.userId === databaseApi.applicationUser?.id && vote.type === "dislike") {
                    result = true;
                    break;
                }
              }
              return result || (voteType === "dislike");
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

        <Button
          styledAs='oval'
          className={styles.commentBtn}
        >
          <span className='material-icons'>
            comment
          </span>
          Reply
        </Button>
      </div>
      {children}
    </div>
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
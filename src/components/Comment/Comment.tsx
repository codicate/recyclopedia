import styles from "./Comment.module.scss";
import { formatDistance } from "date-fns";

import Button from "components/UI/Button";


export interface UserModel {
  name: string;
  avatar: string;
}

export interface CommentModel {
  user?: UserModel;
  content: string;
  createdAt: Date;
  likeCount: number;
  dislikeCount: number;
}

export type ReplyCommentModel = CommentModel;
export interface TopLevelCommentModel extends CommentModel {
  replies: ReplyCommentModel[];
}

function Comment({
  comment,
  parentId,
  /*
    When clicking on reply, and forming the message make a dispatch to
    
    replyToComment(articleName, parentId)

    This is not here, so an easier method would just be to pass in a submit comment
    function in the comment section to make things easier.
  */
  children
}: {
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
        <Button styledAs='oval'>
          <span className='material-icons'>
            thumb_up
          </span>
          {comment.likeCount}
        </Button>
        <Button styledAs='oval'>
          <span className='material-icons'>
            thumb_down
          </span>
          {comment.dislikeCount}
        </Button>
        <Button styledAs='oval'>
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
}: {
  comment: TopLevelCommentModel;
  commentId: number;
}) {
  return (
    <Comment comment={comment}>
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
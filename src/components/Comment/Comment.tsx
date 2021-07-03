import styles from "./Comment.module.scss";
import { formatDistance } from "date-fns";

import Button from "components/UI/Button";


export interface UserModel {
  name: string;
  avatar: string;
}

export interface CommentModel {
  user: UserModel;
  content: string;
  createdAt: Date;
  likeCount: number;
  dislikeCount: number;
  comments: CommentModel[];
}

function Comment({
  comment,
}: {
  comment: CommentModel;
}) {
  return (
    <div className={styles.comment}>
      <div className={styles.commentUser}>
        <img src={comment.user.avatar} alt={comment.user.name} />
        <div>
          <p>{comment.user.name}</p>
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
    </div>
  );
}

export default Comment;

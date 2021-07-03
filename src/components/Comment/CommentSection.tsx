import styles from "./CommentSection.module.scss";

import Comment, { CommentModel } from "./Comment";


function CommentSection({
  comments,
}: {
  comments: CommentModel[];
}) {
  return (
    <div className={styles.commentSection}>
      <div className={styles.commentSectionHeader}>
        <h2>Comments</h2>
      </div>
      <div className={styles.commentSectionContent}>
        {comments.map((comment, idx) =>
          <Comment key={idx} comment={comment} />
        )}
      </div>
    </div>
  );
}

export default CommentSection;

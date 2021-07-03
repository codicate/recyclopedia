import styles from "./CommentSection.module.scss";

import Form from "components/Form/Form";
import Button from "components/UI/Button";
import Comment, { CommentModel } from "./Comment";



function CommentSection({
  comments,
}: {
  comments: CommentModel[];
}) {
  return (
    <div className={styles.commentSection}>
      <Form
        className={styles.commentForm}
        inputItems={{
          name: {
            placeholder: "Name",
          },
          comment: {
            placeholder: "Comment",
            option: "textarea",
          }
        }}
        submitFn={(input) => {
          console.log(input.comment);
        }}
      >
        <Button styledAs='oval'>
          Comment
        </Button>
      </Form>
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

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
      <div className={styles.commentForm}>
        <h2>Add a Comment</h2>
        <Form
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
      </div>

      <div className={styles.commentSectionContent}>
        <h2>Comments</h2>
        <div>
          {comments.map((comment, idx) =>
            <Comment key={idx} comment={comment} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentSection;

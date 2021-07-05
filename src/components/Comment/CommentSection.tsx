import styles from "./CommentSection.module.scss";
import React, { forwardRef } from "react";

import Form from "components/Form/Form";
import Button from "components/UI/Button";
import Comment, { TopLevelCommentModel } from "./Comment";

type CommentSectionProps = {
  comments: TopLevelCommentModel[];
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  function CommentSection(props, ref) {
    return (
      <div
        className={styles.commentSection}
        ref={ref}
        {...props}
      >
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
            {/* \eslint is confused */}
            {/* eslint-disable-next-line react/prop-types */}
            {props.comments.map((comment, idx) =>
              <Comment key={idx} commentId={idx} comment={comment} />
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default CommentSection;

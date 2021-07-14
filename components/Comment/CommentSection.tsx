import styles from "./CommentSection.module.scss";
import React, { forwardRef } from "react";
import { addComment } from "lib/global/articlesSlice";
import { useAppSelector } from "lib/global/hooks";
import { LoginType, selectLoginType, selectAccountDetails } from "lib/global/adminSlice";

import { VoteType } from 'lib/models';
import { commentVote } from "lib/global/articlesSlice";

import Form from "components/Form/Form";
import Button from "components/UI/Button";
import Comment, { TopLevelCommentModel } from "./Comment";


type CommentSectionProps = {
  comments: TopLevelCommentModel[];
  articleName: string;
  refetchComments: () => void;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  function CommentSection(
    {
      comments,
      articleName,
      refetchComments,
      ...props
    }, ref
  ) {
    const loginType = useAppSelector(selectLoginType) || LoginType.Anonymous;
    const accountDetails = useAppSelector(selectAccountDetails);

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
              comment: {
                placeholder: "Comment",
                option: "textarea",
                required: true
              }
            }}
            submitFn={async (input) => {
              await addComment(loginType, accountDetails, articleName, input.comment);
              refetchComments();
            }}
          >
            <Button
              type='submit'
              styledAs='oval'
            >
              Comment
            </Button>
          </Form>
        </div>

        <div className={styles.commentSectionContent}>
          <h2>Comments</h2>
          <div>
            {comments.map((comment, idx) =>
              <Comment
                key={idx}
                commentId={idx}
                comment={comment}
                vote={
                  /*
                  */
                  async function (type: VoteType) {
                    await commentVote(loginType, articleName, type, { id: idx });
                    refetchComments();
                  }
                } />
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default CommentSection;

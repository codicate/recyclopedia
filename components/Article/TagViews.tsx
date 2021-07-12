import styles from "./TagViews.module.scss";


function TagViews({ tags }: { tags?: string[]; }) {
  return (
    <div className={styles.tagView}>
      {
        (tags) ? (
          <>
            <h5>This article was tagged with: </h5>
            {tags.map((tag) => <p key={tag}>{tag}</p>)}
          </>
        ) : (
          <h5>This article has not been tagged.</h5>
        )
      }
    </div>
  );
}

export default TagViews;
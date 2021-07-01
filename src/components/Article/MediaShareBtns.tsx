import styles from "./MediaShareBtns.module.scss";

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
} from "react-share";
import Button from "components/UI/Button";


function MediaShareBtns({
  title,
}: {
  title: string;
}) {
  const articleUrl = location.href;
  const quote = `Give this article a read - ${title}`;
  // this is someone else's job...
  const hashtags = ["projectenv", "climatechange", "environment", "recycling"];

  return (
    <div className={styles.shareBtns}>
      {/* WARN: facebook share is broken, could be my account */}
      < FacebookShareButton
        url={articleUrl}
        quote={quote}
        hashtag="#projectenv"
      >
        <FacebookIcon />
      </FacebookShareButton>
      <TwitterShareButton
        url={articleUrl}
        title={quote}
        hashtags={hashtags}
      >
        <TwitterIcon />
      </TwitterShareButton>
      <RedditShareButton
        url={articleUrl}
        title={quote}
      >
        <RedditIcon />
      </RedditShareButton>
      <Button
        styledAs='oval'
        className={styles.copyLinkBtn + " material-icons"}
        onClick={async (e) => {
          await navigator.clipboard.writeText(articleUrl);
          const btn = e.target as HTMLButtonElement;

          btn.innerHTML = "done";
          btn.classList.add(styles.clicked);

          setTimeout(() => {
            btn.innerHTML = "link";
            btn.classList.remove(styles.clicked);
          }, 2000);
        }}
      >
        link
      </Button>
    </div >
  );
}

export default MediaShareBtns;
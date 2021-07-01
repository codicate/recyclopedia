import styles from "./MediaSharesBtns.module.scss";

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
} from "react-share";


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
    <div>
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
    </div >
  );
}

export default MediaShareBtns;
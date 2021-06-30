import styles from "./MediaSharesBtns.module.scss";

import {
  FacebookShareButton,
  TwitterShareButton,
  RedditShareButton
} from "react-share";


function MediaShareBtns() {
  console.log(location.href);

  return (
    <div>
      {/* < FacebookShareButton url={ } />
      <TwitterShareButton url={ } />
      <AdminRedditShareButton url={ } /> */}
    </div>
  );
}

export default MediaShareBtns;
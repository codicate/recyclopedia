import styles from "./FloatingArticleControl.module.scss";

import MediaShareBtns from "./MediaShareBtns";
import ButtonWithInfo from "components/UI/ButtonWithInfo";
import { useState } from "react";




function FloatingArticleControl({
  title,
}: {
  title: string;
}) {
  const [expandShare, setExpandShare] = useState(false);

  return (
    <div className={styles.floatingArticleControl}>
      <ButtonWithInfo
        materialIcon='thumb_up'
        info={"500"}
      />
      <ButtonWithInfo
        materialIcon='thumb_down'
        info={"500"}
      />
      {(expandShare) && (
        <MediaShareBtns title={title} />
      )}
      <ButtonWithInfo
        materialIcon={(expandShare) ? "close" : "share"}
        onClick={() => setExpandShare(!expandShare)}
      />
    </div >
  );
}

export default FloatingArticleControl;

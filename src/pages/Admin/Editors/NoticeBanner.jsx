import noticeBannerStyles from './NoticeBanner.module.scss';
import React, { useState } from 'react';

export function NoticeBanner({children, dirtyFlag}) {
  const styles = [noticeBannerStyles.dropOut, noticeBannerStyles.dropIn];

  const [selfDirtyFlag, updateSelfDirtyFlag] = useState(dirtyFlag);
  const [style, updateStyle] = useState(0);

  if (dirtyFlag !== selfDirtyFlag) {
      updateStyle((style+1));
      updateSelfDirtyFlag(!selfDirtyFlag);
  }

  return (
    <div className={noticeBannerStyles.main + " " + styles[style % 2]}>
      {children}
    </div>
  );
}

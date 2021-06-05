import noticeBannerStyles from './NoticeBanner.module.scss';
import { useState } from 'react';

export function NoticeBanner({
  children, dirtyFlag
}: {
  children: React.ReactNode;
  dirtyFlag: boolean;
}) {
  const styles = [noticeBannerStyles.dropOut, noticeBannerStyles.dropIn];

  const [selfDirtyFlag, updateSelfDirtyFlag] = useState(dirtyFlag);
  const [style, updateStyle] = useState(0);

  if (dirtyFlag !== selfDirtyFlag) {
    updateStyle((style + 1));
    console.log(style);
    updateSelfDirtyFlag(!selfDirtyFlag);
  }

  return (
    <div className={noticeBannerStyles.main + " " + styles[style % 2]}>
      {children}
    </div>
  );
}

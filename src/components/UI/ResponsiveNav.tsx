import styles from "./ResponsiveNav.module.scss";
import React, { useRef, useState } from "react";
import cn from "classnames";

import useEventListener from "hooks/useEventListener";

type MediaQueries = Record<number, React.ReactNode>;

function ResponsiveNav({
  children,
  className,

  ...props
}: {
  children: React.ReactNode,
} & React.HTMLAttributes<HTMLElement>
) {
  const [shrink, setShrink] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEventListener(window, "resize", () => {
    const spanEl = spanRef.current;
    if (!spanEl) return;
    if (!spanEl.parentElement) return;

    console.log(spanEl.getBoundingClientRect().width);

    if (spanEl.getBoundingClientRect().width >= spanEl.parentElement.getBoundingClientRect().width) {

      setShrink(true);
      spanEl.style.visibility = "hidden";
      spanEl.style.position = "fixed";
      spanEl.style.top = "0";
      spanEl.style.left = "0";
    } else {
      setShrink(false);
      spanEl.style.visibility = "visible";
      spanEl.style.position = "static";
    }
  });

  return (
    <nav
      className={cn(styles.nav, className)}
      {...props}
    >
      {(shrink) && (
        <button className={"material-icons " + styles.menu}>
          menu
        </button>
      )}
      <span ref={spanRef}>
        {children}
      </span>

    </nav>
  );
}

export default ResponsiveNav;

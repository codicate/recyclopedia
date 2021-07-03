import styles from "./ResponsiveNav.module.scss";
import React, { useEffect, useRef, useState } from "react";
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
  const [shrunk, setShrunk] = useState(false);
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const linksRef = useRef<HTMLDivElement>(null);

  const handleResize = () => {
    const spanEl = linksRef.current;
    if (!spanEl || !spanEl.parentElement?.parentElement) return;

    console.log(spanEl.getBoundingClientRect().width);

    if (spanEl.getBoundingClientRect().width >= spanEl.parentElement.parentElement.getBoundingClientRect().width) {
      setShrunk(true);
    } else {
      setShrunk(false);
    }
  };

  useEffect(() => {
    handleResize();
  }, []);

  useEventListener(window, "resize", () => {
    handleResize();
  });

  return (
    <nav
      className={cn(styles.nav, className)}
      {...props}
    >
      {(shrunk) && (
        <>
          <button
            className={"material-icons " + styles.menu}
            onClick={() =>
              setSidebarOpened(true)
            }
          >
            menu
          </button>

        </>
      )}
      <div
        className={cn(styles.overlay, {
          [styles.shrunk]: shrunk,
          [styles.opened]: sidebarOpened
        })}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          setSidebarOpened(false);
        }}
      >
        <div
          ref={linksRef}
          className={cn(styles.links, {
            [styles.opened]: sidebarOpened
          })}
        >
          {children}
        </div>
      </div>

    </nav>
  );
}

export default ResponsiveNav;

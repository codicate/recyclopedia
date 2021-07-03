import styles from "./ResponsiveNav.module.scss";
import { useEffect, useRef, useState } from "react";
import cn from "classnames";

import useEventListener from "hooks/useEventListener";


function ResponsiveNav({
  sidebarToggle,
  children,
  className,
  ...props
}: {
  sidebarToggle: (setSidebarOpened: React.Dispatch<React.SetStateAction<boolean>>) => React.ReactNode,
  children: React.ReactNode,
} & React.HTMLAttributes<HTMLElement>
) {
  const linksRef = useRef<HTMLDivElement>(null);
  const [shrunk, setShrunk] = useState(false);
  const [sidebarOpened, setSidebarOpened] = useState(false);

  const handleResize = () => {
    const spanEl = linksRef.current;
    if (!spanEl || !spanEl.parentElement?.parentElement) return;

    if (spanEl.getBoundingClientRect().width >= spanEl.parentElement.parentElement.getBoundingClientRect().width) {
      setShrunk(true);
    } else {
      setShrunk(false);
    }
  };

  useEffect(() => {
    handleResize();
  }, [children]);
  // Children is added to the dependency array so that when the user login/logout, navbar will resize in response

  useEventListener(window, "resize", () => {
    handleResize();
  });

  return (
    <nav
      className={cn(styles.nav, className)}
      {...props}
    >
      {(shrunk) && (sidebarToggle(setSidebarOpened))}
      <div
        className={cn(styles.overlay, {
          [styles.shrunk]: shrunk,
          [styles.opened]: sidebarOpened
        })}
        onClick={(e) => {
          const overlay = e.target as HTMLDivElement;
          if (overlay !== e.currentTarget) return;

          overlay.classList.add(styles.slideOut);
          overlay.addEventListener("animationend", () => {
            if (overlay.classList.contains(styles.slideOut)) {
              overlay.classList.remove(styles.slideOut);
              setSidebarOpened(false);
            }
          });
        }}
      >
        <div
          ref={linksRef}
          className={styles.links}
        >
          {children}
        </div>
      </div>

    </nav >
  );
}

export default ResponsiveNav;

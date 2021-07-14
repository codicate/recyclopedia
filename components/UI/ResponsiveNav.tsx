import styles from "./ResponsiveNav.module.scss";
import { useEffect, useRef, useState } from "react";
import cn from "classnames";

import useEventListener from "lib/hooks/useEventListener";


function ResponsiveNav({
  children,
  className,
  ...props
}: {
  children: React.ReactNode,
} & React.HTMLAttributes<HTMLElement>
) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [shrunk, setShrunk] = useState(true);
  const [sidebarOpened, setSidebarOpened] = useState(false);

  const handleResize = () => {
    const sidebar = sidebarRef.current;
    const navbar = sidebar?.parentElement?.parentElement;
    if (!sidebar || !navbar) return;

    if (sidebar.getBoundingClientRect().width >= navbar.getBoundingClientRect().width) {
      setShrunk(true);
    } else {
      setShrunk(false);
      // If the sidebar is too small, there's no reason to technically have it open
      // you could do an && on the bottom, but it's probably not expected behavior I expect
      // since it's kind of jarring to have it suddenly open lol.
      setSidebarOpened(false);
    }
  };

  useEffect(() => {
    handleResize();
  }, [children]);
  // Children is added to the dependency array so that when the user login/logout, navbar will resize in response

  useEventListener(window, "resize", () => {
    handleResize();
  });

  const closeSidebar = () => {
    const sidebar = sidebarRef.current;
    const overlay = sidebar?.parentElement as HTMLDivElement;
    if (!sidebar || !overlay) return;

    overlay.classList.add(styles.slideOut);
    overlay.addEventListener("animationend", () => {
      if (overlay.classList.contains(styles.slideOut)) {
        overlay.classList.remove(styles.slideOut);
        setSidebarOpened(false);
      }
    });
  };

  return (
    <nav
      className={cn(styles.nav, className)}
      {...props}
    >
      {(shrunk) && (
        <button
          className={cn("material-icons", styles.menuBtn)}
          onClick={() =>
            setSidebarOpened(true)
          }
        >
          menu
        </button>
      )}
      <div
        className={cn(styles.overlay, {
          [styles.shrunk]: shrunk,
          [styles.opened]: sidebarOpened
        })}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          closeSidebar();
        }}
      >
        <div
          ref={sidebarRef}
          className={styles.sidebar}
        >
          {(sidebarOpened) && (
            <button
              className={cn("material-icons", styles.closeBtn)}
              onClick={() => closeSidebar()}
            >
              close
            </button>
          )}
          {children}
        </div>
      </div>
    </nav >
  );
}

export default ResponsiveNav;

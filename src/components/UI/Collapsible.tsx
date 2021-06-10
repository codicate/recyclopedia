import styles from "./Collapsible.module.scss";
import React, { useState } from "react";

function Collapsible({
  header,
  centered = false,
  collapsed = false,
  children,
  ...props
}: {
  header: string | React.ReactNode;
  collapsed?: boolean;
  centered?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>
) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div className={styles.collapsibleContainer} {...props}>
      <div
        className={styles.collapsibleTitle + " " + (centered && styles.centered) || ""}
        onClick={() =>
          setIsCollapsed((isCollapsed) => !isCollapsed)
        }
      >
        <p>{header}</p>
        <div className={`material-icons + ${isCollapsed ? styles.collapsed : ""}`}>
          expand_more
        </div>
      </div>

      {(!isCollapsed) && children}
    </div>
  );
}

export default Collapsible;

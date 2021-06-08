import styles from "./Collapsible.module.scss";
import { useState } from "react";

function Collapsible({
  title,
  collapsed = false,
  children
}: {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div id={styles.collapsibleContainer}>
      <div
        id={styles.collapsibleTitle}
        onClick={() =>
          setIsCollapsed((isCollapsed) => !isCollapsed)
        }
      >
        <p>{title}</p>
        <div className={`material-icons + ${isCollapsed ? styles.collapsed : ""}`}>
          expand_more
        </div>
      </div>

      {(!isCollapsed) && children}
    </div>
  );
}

export default Collapsible;

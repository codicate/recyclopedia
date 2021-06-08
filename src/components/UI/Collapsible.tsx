import styles from "./Collapsible.module.scss";
import { useState } from "react";

function Collapsible({
  title,
  collapsed = false,
  children,
  ...props
}: {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div className={styles.collapsibleContainer} {...props}>
      <div
        className={styles.collapsibleTitle}
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

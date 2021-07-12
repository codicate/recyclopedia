import styles from "./Collapsible.module.scss";
import { useState } from "react";
import cn from "classnames";

function Collapsible({
  header,
  centered = false,
  collapsed = false,
  children,
  className,
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
    <div
      className={cn(styles.collapsibleContainer, className)}
      {...props}
    >
      <div
        className={cn(styles.collapsibleTitle, {
          [styles.centered]: centered
        })}
        onClick={() =>
          setIsCollapsed((isCollapsed) => !isCollapsed)
        }
      >
        <p>{header}</p>
        <div
          className={cn("material-icons", {
            [styles.collapsed]: isCollapsed
          })}
        >
          expand_more
        </div>
      </div>

      {(!isCollapsed) && children}
    </div >
  );
}

export default Collapsible;

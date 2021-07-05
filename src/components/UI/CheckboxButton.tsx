import styles from "./CheckboxButton.module.scss";
import cn from "classnames";


function CheckedBoxButton({
  name,
  styledAs,
  checked,
  onCheck,
  children,
  className,
  ...props
}: {
  name: string;
  styledAs?: "oval" | "circle";
  checked?: boolean;
  onCheck?: (checked: boolean) => void,
  children: React.ReactNode;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {

  return (
    <div
      className={cn(
        styles.button,
        styledAs ? styles[styledAs] : styles.default,
        className
      )}
      {...props}
    >
      <input type="checkbox"
        value={name}
        checked={checked}
        onChange={(event) => {
          console.log("yooooo");
          onCheck?.(event.target.checked);
        }
        }
      />
      <label htmlFor={name}>{children}</label>
    </div >
  );
}

export default CheckedBoxButton;

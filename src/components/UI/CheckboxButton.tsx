import styles from "./CheckboxButton.module.scss";
import cn from "classnames";


function CheckedBoxButton({
  children,
  styledAs,
  checked,
  onCheck,
  className,
  ...props
}: {
  checked?: boolean;
  onCheck?: (checked: boolean) => void,
  children: string;
  styledAs?: "oval";
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {

  return (
    <div
      className={cn(
        styles.button,
        styledAs ? styles[styledAs] : "",
        className
      )}
      {...props}
    >
      <input type="checkbox"
        value={children}
        checked={checked}
        onChange={(event) =>
          onCheck?.(event.target.checked)
        }
      />
      <label htmlFor={children}>{children}</label>
    </div >
  );
}

export default CheckedBoxButton;

import styles from "./CheckboxButton.module.scss";
import buttonStyles from "./Button.module.scss";
import { ButtonProps } from "./Button";

function CheckedBoxButton({
  children,
  styledAs,
  checked,
  onCheck,
  ...props
}: {
  checked?: boolean;
  onCheck?: (checked: boolean) => void,
} & ButtonProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {
  return (
    <div
      className={`${styles.button} ${styledAs ? buttonStyles[styledAs] : ""}`}
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

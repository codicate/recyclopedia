import styles from "./CheckboxButton.module.scss";

function CheckedBoxButton({
  children,
  styledAs,
  checked,
  onCheck,
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
      className={`${styles.button} ${styledAs ? styles[styledAs] : ""} ${props.className || ""}`}
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

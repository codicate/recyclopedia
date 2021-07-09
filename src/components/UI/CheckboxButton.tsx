import styles from "./CheckboxButton.module.scss";
import { forwardRef } from "react";
import cn from "classnames";


type CheckboxProps = {
  name: string;
  styledAs?: "oval" | "circle";
  checked?: boolean;
  onCheck?: (checked: boolean) => void,
  children: React.ReactNode;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const CheckedBoxButton = forwardRef<HTMLInputElement, CheckboxProps>(
  function CheckedBoxButton(
    {
      name,
      styledAs,
      checked,
      onCheck,
      children,
      className,
      onChange,
      ...props
    },
    ref
  ) {
    return (
      <div
        className={cn(
          styles.button,
          styledAs ? styles[styledAs] : styles.default,
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          value={name}
          checked={checked}
          onChange={(event) => {
            onChange?.(event);
            onCheck?.(event.target.checked);
          }}
          {...props}
        />
        <label htmlFor={name}>{children}</label>
      </div >
    );
  }
);

export default CheckedBoxButton;

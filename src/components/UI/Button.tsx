import { HtmlHTMLAttributes } from "react";
import styles from "./Button.module.scss";

function Button({
  children,
  type = "button",
  styledAs,
  ...props
}: {
  children?: React.ReactNode;
  type?: "submit" | "reset" | "button";
  styledAs?: "regular" | "small";
} & HtmlHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      className={`${styles.button} ${styledAs ? styles[styledAs] : ""}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

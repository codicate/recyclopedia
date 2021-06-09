import styles from "./Button.module.scss";

function Button({
  children,
  type = "button",
  styledAs,
  ...props
}: {
  children: string;
  styledAs?: "";
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  return (
    <button
      className={`${styles.button} ${styledAs ? styles[styledAs] : ""} ${props.className || ""}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

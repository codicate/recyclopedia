import styles from "./Button.module.scss";

function Button({
  children,
  type = "button",
  styledAs,
  className,
  ...props
}: {
  children: React.ReactNode;
  styledAs?: "oval";
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  return (
    <button
      className={`
        ${styles.button} 
        ${styledAs ? styles[styledAs] : styles.default} 
        ${className || ""}
      `}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

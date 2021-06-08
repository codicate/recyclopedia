import styles from "./Button.module.scss";

export interface ButtonProps {
  children: string;
  styledAs?: "regular" | "small";
} 

function Button({
  children,
  type = "button",
  styledAs,
  ...props
}: ButtonProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
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

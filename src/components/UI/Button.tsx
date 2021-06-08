import styles from "./Button.module.scss";

const Button = ({
  children = "",
  type = "button",
  styleOption,
  ...props
}: {
  children?: React.ReactNode;
  type?: "submit" | "reset" | "button";
  styleOption?: string;
  onClick?(): void;
}) => {
  return (
    <button
      className={`${styles.button} ${styleOption ? styles[styleOption] : ""}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

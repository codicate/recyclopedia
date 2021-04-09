import styles from 'components/Form/Button.module.scss';

const Button = ({
  children = '',
  type = 'button',
  styleOption,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styleOption ? styles[styleOption] : ''}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

import styles from 'components/Form/Input.module.scss';

const Input = ({
  changeHandler = () => { },
  label,
  ...props
}) => {
  return (
    <div className={styles.group}>
      <input
        className={styles.input}
        onChange={changeHandler}
        {...props}
      />
      {label && (
        <label
          className={`${props.value ? styles.shrink : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Input;

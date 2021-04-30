import styles from 'components/Form/Input.module.scss';

const Input = ({
  changeHandler,
  label,
  option,
  readOnly,
  value,
  defaultValue,
  ...props
}) => {
  return (
    <div className={styles.group}>
      {
        option === 'textarea'
          ? (
            <textarea
              className={styles.textarea}
              onChange={changeHandler}
              {...(readOnly ? { defaultValue: value } : { value: value })}
              {...props}
            />
          )
          : (
            <input
              readOnly
              className={styles.input}
              onChange={changeHandler}
              {...(readOnly ? { defaultValue: value } : { value: value })}
              {...props}
            />
          )
      }
      {
        label && (
          <label
            className={`${value ? styles.shrink : ''}`}
          >
            {label}
          </label>
        )
      }
    </div>
  );
};

export default Input;

import styles from 'components/Form/Input.module.scss';

const Input = ({
  changeHandler = () => { },
  label,
  option,
  readOnly,
  ...props
}) => {
  return (
    <div className={styles.group}>
      {
        option === 'textarea'
          ? (
            <textarea
              className={styles.textarea}
              onChange={readOnly ? undefined : changeHandler}
              {...props}
            />
          )
          : (
            <input
              className={styles.input}
                onChange={readOnly ? undefined : changeHandler}
              {...props}
            />
          )
      }
      {
        label && (
          <label
            className={`${props.value ? styles.shrink : ''}`}
          >
            {label}
          </label>
        )
      }
    </div>
  );
};

export default Input;

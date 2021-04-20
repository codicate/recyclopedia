import styles from 'components/Form/Input.module.scss';

const Input = ({
  changeHandler = () => { },
  label,
  option,
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
              {...props}
            />
          )
          : (
            <input
              className={styles.input}
              onChange={changeHandler}
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

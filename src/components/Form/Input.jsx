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
  const InputOrTextarea = option || 'input';

  return (
    <div className={styles.group}>
      <InputOrTextarea
        className={(option === 'textarea') ? styles.textarea : styles.input}
        onChange={changeHandler}
        {...(readOnly ? { defaultValue: value, readOnly: true } : { value: value })}
        {...props}
      />
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

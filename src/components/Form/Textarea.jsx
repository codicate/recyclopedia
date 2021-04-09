import styles from 'components/Form/Textarea.module.scss';

const Textarea = ({
  changeHandler = () => { },
  label,
  ...props
}) => {
  return (
    <div className={styles.group}>
      <textarea
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

export default Textarea;

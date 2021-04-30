import styles from 'components/Form/Input.module.scss';
import { createElement } from 'react';

const Input = ({
  changeHandler,
  label,
  option,
  readOnly,
  value,
  defaultValue,
  ...props
}) => {
  
  const properties = {
    className: (option === 'textarea') ? styles.textarea : styles.input,
    onChange: changeHandler,
    ...(readOnly ? { defaultValue: value, readOnly: true } : { value: value }),
    ...props
  };

  return (
    <div className={styles.group}>
      { createElement(option || 'input', { ...properties })}
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

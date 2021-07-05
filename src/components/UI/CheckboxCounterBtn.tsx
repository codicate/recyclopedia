import styles from "./CheckboxCounterBtn.module.scss";

import CheckboxButton from "components/UI/CheckboxButton";


function CheckboxCounterBtn({
  name,
  materialIcon,
  info,
  ...props
}: {
  name: string;
  materialIcon: string,
  info?: string;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLInputElement>, HTMLInputElement>
) {
  return (
    <div className={styles.checkboxCounterBtn}>
      <CheckboxButton
        styledAs='circle'
        name={name}
        {...props}
      >
        <span className='material-icons'>
          {materialIcon}
        </span>
      </CheckboxButton >
      <p>{info}</p>
    </div>
  );
}

export default CheckboxCounterBtn;
import styles from "./ButtonWithInfo.module.scss";

import Button from "components/UI/Button";


function ButtonWithInfo({
  materialIcon,
  info,
  ...props
}: {
  materialIcon: string,
  info?: string;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  return (
    <div className={styles.buttonWithInfo}>
      <Button
        styledAs='circle'
        {...props}
      >
        <span className='material-icons'>
          {materialIcon}
        </span>
      </Button >
      <p>{info}</p>
    </div>
  );
}

export default ButtonWithInfo;
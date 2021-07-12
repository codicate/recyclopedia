import styles from "./CheckboxCounterBtn.module.scss";
import { forwardRef } from "react";

import CheckboxButton from "components/UI/CheckboxButton";


type CheckboxProps = Omit<Parameters<typeof CheckboxButton>[0], "styledAs" | "children">;
type CheckboxCounterProps = {
  materialIcon: string,
  counter?: number;
} & CheckboxProps;

const CheckboxCounterBtn = forwardRef<HTMLInputElement, CheckboxCounterProps>(
  function CheckboxCounterBtn(
    {
      materialIcon,
      counter,
      ...props
    },
    ref
  ) {
    return (
      <div className={styles.checkboxCounterBtn}>
        <CheckboxButton
          ref={ref}
          styledAs='circle'
          {...props}
        >
          <span className='material-icons'>
            {materialIcon}
          </span>
        </CheckboxButton >
        <p>{counter}</p>
      </div>
    );
  }
);

export default CheckboxCounterBtn;
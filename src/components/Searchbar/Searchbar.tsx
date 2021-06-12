import styles from "components/Searchbar/Searchbar.module.scss";
import useEventListener from "hooks/useEventListener";
import { useState, useRef } from "react";


export default function Searchbar({
  returnInput
}: {
  returnInput: (input: string) => void;
}) {
  const [input, setInput] = useState("");
  const lastTimeTyping = useRef(new Date().getTime());
  const searchbar = useRef<null | HTMLInputElement>(null);

  useEventListener(document.body, "keydown", (e) => {
    if (e.key === "/") {
      e.preventDefault();
      searchbar.current?.focus();
    }
  });

  const changeHandler = (input: string) => {
    lastTimeTyping.current = new Date().getTime();

    setTimeout(() => {
      if (new Date().getTime() - lastTimeTyping.current >= 500)
        returnInput(input);
    }, 500);
  };

  return (
    <div id={styles.searchbar}>
      <input
        autoFocus
        type='text'
        placeholder='Search'
        ref={searchbar}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          changeHandler(e.target.value);
        }}
        onFocus={(e) => returnInput(e.target.value)}
        onBlur={() => returnInput("")}
      />
      <div id={styles.searchbarControl}>
        <div
          id={styles.clear}
          className='material-icons'
          onClick={() => {
            setInput("");
            changeHandler("");
            searchbar.current && searchbar.current.focus();
          }}
        >
          clear
        </div>
        {/* <div
          id={styles.search}
          className='material-icons'
        >
          search
        </div> */}
      </div>
    </div>
  );
}
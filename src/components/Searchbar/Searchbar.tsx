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
          lastTimeTyping.current = new Date().getTime();
          setTimeout(() => {
            if (new Date().getTime() - lastTimeTyping.current >= 500)
              returnInput(e.target.value);
          }, 500);
        }}
      />
      <div id={styles.clearDiv}>
        <span
          id={styles.clear}
          className='material-icons btn'
          onClick={() => {
            setInput("");
            searchbar.current && searchbar.current.focus();
          }}
        >
          clear
        </span>
      </div>
    </div>
  );
}
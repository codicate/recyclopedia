import styles from "./Searchbar.module.scss";
import useEventListener from "hooks/useEventListener";
import { useState, useRef } from "react";


export default function Searchbar({
  isSearchResultsOpened,
  returnInput
}: {
  isSearchResultsOpened: boolean;
  returnInput: (input: string) => void;
}) {
  const [input, setInput] = useState("");
  const searchbar = useRef<null | HTMLInputElement>(null);

  const openSearchResultsDelay = 500;
  const lastTimeTyped = useRef(new Date().getTime());

  useEventListener(document.body, "keydown", (e) => {
    if (e.key === "/") {
      e.preventDefault();
      searchbar.current?.focus();
    }
  });

  const changeHandler = (input: string) => {
    lastTimeTyped.current = new Date().getTime();

    setTimeout(() => {
      if (new Date().getTime() - lastTimeTyped.current >= openSearchResultsDelay) {
        returnInput(input);
      }
    }, openSearchResultsDelay);
  };

  return (
    <div
      className={`
        ${styles.searchbar}
        ${(searchbar && isSearchResultsOpened) ? styles.focused : ""}
      `}
      onFocus={() => {
        // The callback is necessary because when focus happens, input is yet to update
        setInput(input => {
          returnInput(input);
          return input;
        });
      }}
    >
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
        onBlur={() => setInput("")}
      />
      {(input) && (
        <div id={styles.searchbarControl}>
          <div
            id={styles.clear}
            className='material-icons'
            onClick={() => {
              setInput("");
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
      )}
    </div>
  );
}

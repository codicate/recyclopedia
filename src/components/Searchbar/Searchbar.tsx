import styles from 'components/Searchbar/Searchbar.module.scss';
import { useState, useRef } from 'react';
import { useTimeout } from 'utils/functions';


export default function Searchbar({
  returnInput
}: {
  returnInput: (input: string) => void;
}) {
  const [input, setInput] = useState('');
  const searchbar = useRef<null | HTMLInputElement>(null);

  useTimeout(() => returnInput(input), 500);

  return (
    <div id={styles.searchbar}>
      <input
        autoFocus
        type='text'
        placeholder='Search'
        ref={searchbar}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div id={styles.clearDiv}>
        <span
          id={styles.clear}
          className='material-icons btn'
          onClick={() => {
            setInput('');
            searchbar.current && searchbar.current.focus();
          }}
        >
          clear
        </span>
      </div>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { useTimeout } from 'utils/functions.js';
import styles from 'components/Searchbar/Searchbar.module.scss';

export default function Searchbar({ returnInput }) {
  const [input, setInput] = useState('');
  const searchbar = useRef(null);

  useTimeout(500, () => { returnInput(input); }, [input]);

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
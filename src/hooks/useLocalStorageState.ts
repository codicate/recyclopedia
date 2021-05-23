import { useState } from 'react';

function useLocalStorageState<T>(itemName: string, initialValue: T) {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(itemName);

      return item
        ? JSON.parse(item)
        : initialValue;

    } catch (err) {

      console.error(err);
      return initialValue;
    }
  });

  const syncStateToLocalStorage = (value: T) => {
    try {
      const valueToStore = value instanceof Function
        ? value(state)
        : value;

      setState(valueToStore);
      localStorage.setItem(itemName, JSON.stringify(valueToStore));

    } catch (err) {
      console.error(err);
    }
  };

  return [state, syncStateToLocalStorage];
}

export default useLocalStorageState;
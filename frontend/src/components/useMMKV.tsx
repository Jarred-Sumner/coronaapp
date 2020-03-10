import {useState} from 'react';
import {setItem, getItem} from '../lib/Yeet';

export function useMMKV(
  key: string,
  _initialValue: number | string | Object,
  type: any,
  forceInitialValue = false,
) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    const initialValue =
      typeof _initialValue === 'function' ? _initialValue() : _initialValue;
    try {
      console.log({forceInitialValue, initialValue});
      if (forceInitialValue) {
        return initialValue;
      }
      // Get from local storage by key
      const item = getItem(key, type);
      // Parse stored json or if none return initialValue
      return item ?? initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      setItem(key, valueToStore, type);
      console.log('Saving', key);
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

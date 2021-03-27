import { useEffect, useRef } from 'react';
import getElement from 'functions/getElement';

const useEventListener = (eventTarget, eventType, handler, options = {}) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const element = getElement(eventTarget);
    if (!element || !element.addEventListener) return;

    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventType, eventListener, options);

    return () => element.removeEventListener(eventType, eventListener, options);
  }, [eventTarget, eventType, handler, options]);
};

export default useEventListener;
import { useEffect, useRef } from "react";

const useEventListener = <
  E extends () => Element | Document | Window,
  T extends keyof ElementEventMap | keyof DocumentEventMap | keyof WindowEventMap,
  >(
    getElement: E,
    eventType: T | string,
    listener: (
      e:
        T extends keyof ElementEventMap ? ElementEventMap[T]
        : T extends keyof DocumentEventMap ? DocumentEventMap[T]
        : T extends keyof WindowEventMap ? WindowEventMap[T]
        : Event
    ) => void,
    options?: boolean | AddEventListenerOptions

  ) => {

  const savedListener = useRef(listener);
  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  useEffect(() => {
    const element = getElement();
    if (!element || !element.addEventListener) return;

    const wrappedListener: typeof savedListener.current = (e) => savedListener.current(e);
    element.addEventListener(eventType, wrappedListener as EventListener, options);

    return () => element.removeEventListener(eventType, wrappedListener as EventListener, options);
  }, [getElement, eventType, options]);
};

export default useEventListener;
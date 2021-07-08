import { useEffect, useRef } from "react";

export const useTimeout = (time, _callback) => {
  const callback = useRef();

  useEffect(() => {
    callback.current = _callback;
  }, [_callback]);

  useEffect(() => {
    const timeoutId = setTimeout(callback.current, time);
    return () => clearTimeout(timeoutId);
  }, [time]);
};

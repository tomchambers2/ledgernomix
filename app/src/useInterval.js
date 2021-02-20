import { useRef, useEffect } from "react";

export default function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    console.log("CALLBACK CHANGED");
    savedCallback.current = callback;
    savedCallback.current();
  }, [callback]);

  useEffect(() => {
    console.log("call now");
    if (savedCallback.current) savedCallback.current();
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

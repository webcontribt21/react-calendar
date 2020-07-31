import React, { useEffect, useRef, useState } from 'react';

const useInterval = (callback, delay, attempts = 0) => {
  const savedCallback = useRef();
  let counter = 0;
  let instance = null;

  const tick = () => {
    if (counter > 0 && counter === attempts - 1) {
      clearInterval(instance);
    }
    counter += 1;
    return savedCallback.current();
  };

  useEffect(() => {
    savedCallback.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (delay !== null) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      instance = setInterval(tick, delay);
      return () => clearInterval(instance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
};

export { useInterval as default };

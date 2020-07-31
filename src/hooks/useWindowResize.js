import React, { useCallback, useEffect, useState } from 'react';

const useWindowSize = () => {
  const isClient = typeof window === 'object';

  const getSize = useCallback(
    () => ({
      height: isClient ? window.innerHeight : undefined,
      outerHeight: isClient ? window.outerHeight : undefined,
      outerWidth: isClient ? window.outerWidth : undefined,
      width: isClient ? window.innerWidth : undefined,
    }),
    [isClient],
  );

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    const handleResize = () => setWindowSize(getSize());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize, isClient]);

  return windowSize;
};

export default useWindowSize;

import React, { useEffect, useState } from 'react';
import { get } from '../utils/fetch';

const useFetch = (url, options = {}) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const res = await get(url, {
          ...options,
        });
        const json = await res.json();

        setResponse(json);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { error, isLoading, response };
};

export { useFetch as default };

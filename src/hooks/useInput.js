import { useCallback, useState } from 'react';

const useInput = initialValue => {
  const [values, setValues] = useState(initialValue || {});

  const reset = useCallback(() => setValues({}), []);

  return {
    bind: {
      onChange: event => {
        const {
          target: { name, value, checked, type },
        } = event;

        setValues({
          ...values,
          [name]: type === 'checkbox' ? checked : value,
        });
      },
    },
    reset,
    setValue: (lbl, val) => {
      setValues({
        ...values,
        [lbl]: val,
      });
    },
    setValues,
    values,
  };
};

export { useInput as default };

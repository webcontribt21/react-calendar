import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import style from './style.module.scss';
import Switch from '../../components/switch/Switch';

const SwitchCell = ({ size, row, updateFunc }) => {
  const [on, isOn] = useState([]);

  const {
    cell: { value },
    column: { id: columnName },
    row: {
      original: { id },
    },
  } = row;

  const toggleActive = useCallback(
    async (index, record) => {
      const toggleValue =
        on.length && typeof on[index] === 'boolean'
          ? !on[index]
          : !record[columnName];

      await updateFunc({
        id,
        value: {
          ...record,
          [columnName]: toggleValue,
        },
      });

      const newOn = [...on];
      newOn[index] = toggleValue;

      isOn(newOn);
    },
    [columnName, id, on, updateFunc],
  );

  if (!value) {
    return null;
  }

  return (
    <div className={style.multiCell}>
      {value.map((col, i) => (
        <div
          key={`switch-col-${shortid.generate()}`}
          className={style.subItem}
        >
          <Switch
            size={size}
            isOn={on.length ? on[i] : col[columnName]}
            handleToggle={() => toggleActive(i, value[i])}
          />
        </div>
      ))}
    </div>
  );
};

SwitchCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
  size: PropTypes.string,
  updateFunc: PropTypes.func,
};

SwitchCell.defaultProps = {
  size: 'default',
  updateFunc: () => {},
};

export { SwitchCell as default };

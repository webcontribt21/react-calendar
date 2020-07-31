import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import style from './style.module.scss';
import Switch from '../../components/switch/Switch';

const SwitchCell = ({ row, updateFunc }) => {
  const {
    cell: { value },
    column: { id: columnName },
    row: {
      original: { id },
    },
  } = row;

  const [on, isOn] = useState(value);

  const toggleActive = useCallback(() => {
    updateFunc({
      id,
      value: {
        [columnName]: !on,
      },
    });

    isOn(!on);
  }, [columnName, id, on, updateFunc]);

  return (
    <Switch size="small" isOn={on} handleToggle={toggleActive} />
  );
};

SwitchCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
  updateFunc: PropTypes.func,
};

SwitchCell.defaultProps = {
  updateFunc: () => {},
};

export { SwitchCell as default };

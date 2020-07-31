import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import style from './style.module.scss';
import Switch from '../../components/switch/Switch';

const SwitchCell = ({ size, row, updateFunc }) => {
  const {
    cell: { value },
    column: { id: columnName },
    row: {
      original: { meetingId },
    },
  } = row;

  const [on, isOn] = useState(value);

  const toggleActive = useCallback(() => {
    updateFunc({
      [columnName]: !on,
      id: meetingId,
    });

    isOn(!on);
  }, [columnName, meetingId, on, updateFunc]);

  return (
    <div className={style.multiCell}>
      <Switch size={size} isOn={on} handleToggle={toggleActive} />
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

import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import style from './style.module.scss';
import TouchDrops from './TouchDrops';

const TouchDropsCell = ({ row }) => {
  const {
    cell: { value },
    row: {
      original: { attempts, attemptsTotal },
    },
  } = row;

  if (value) {
    return (
      <div className={style.multiCell}>
        <div
          key={`touches-meeting-${shortid.generate()}`}
          className={style.subItem}
        >
          <TouchDrops total={attemptsTotal} attempts={attempts} />
        </div>
      </div>
    );
  }

  return null;
};

TouchDropsCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { TouchDropsCell as default };

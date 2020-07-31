/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';

const TouchDrops = ({ total, attempts }) => (
  <div
    className={style.dropWrapper}
    data-rh={`${attempts} of ${total} attempts`}
    data-rh-at="bottom"
  >
    <svg viewBox="0 0 40 40" className={style.emailCount}>
      {[...Array(total)].map((_, i) => {
        const isActive = i <= attempts - 1;
        const percentage = Math.floor(100 / total);
        const remaining = 100 - percentage;
        const offset =
          i === 0 ? 25 : 100 - (100 / total) * i + 25 - 1;

        return (
          <circle
            key={`drop-${Math.random() * 1000}`}
            cx="22"
            cy="20"
            r="15"
            fill="transparent"
            className={isActive ? style.active : style.circle}
            strokeWidth="5"
            strokeDasharray={`${percentage} ${remaining}`}
            strokeDashoffset={`${offset}`}
          />
        );
      })}
    </svg>
  </div>
);

TouchDrops.propTypes = {
  attempts: PropTypes.number,
  total: PropTypes.number,
};

TouchDrops.defaultProps = {
  attempts: 0,
  total: 3,
};

export default TouchDrops;

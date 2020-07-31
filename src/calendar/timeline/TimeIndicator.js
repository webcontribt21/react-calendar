import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import useInterval from '../../hooks/useInterval';
import style from './timeline.module.scss';

dayjs.extend(advancedFormat);

const TimeIndicator = ({ date, onClick, on }) => {
  const [currentTime, setCurrentTime] = useState(null);

  const startTime = () => {
    const time = dayjs().format('h:mm:ss');
    setCurrentTime(time);
  };

  useInterval(startTime, 1000);

  const Date = () => {
    if (date) {
      const month = dayjs(date).format('MMMM');
      const day = dayjs(date).format('dddd - Do');

      return (
        <span className={style.date}>
          <span>{month}</span>
          <span>{day}</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div
      className={cx(style.timeIndicator, { [style.inactive]: !on })}
    >
      <div className={style.pole} />
      <button
        onClick={onClick}
        type="button"
        className={cx('btn is-ghost', style.timer)}
      >
        {currentTime}
      </button>
      <Date />
    </div>
  );
};

TimeIndicator.propTypes = {
  date: PropTypes.objectOf(PropTypes.any),
  on: PropTypes.bool,
  onClick: PropTypes.func,
};

TimeIndicator.defaultProps = {
  date: null,
  on: true,
  onClick: e => {},
};

export { TimeIndicator as default };

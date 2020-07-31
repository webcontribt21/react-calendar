import React, { useCallback, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import shortid from 'shortid';
import style from './timeline.module.scss';

const Day = ({ am, interval, value, onActive }) => {
  const [dayNode, setDayNode] = useState(null);

  const ref = useCallback(node => {
    if (node) {
      setDayNode(node);
      // setX(node.getClientRects()[0].x);
    }
  }, []);

  useLayoutEffect(() => {
    if (dayNode && dayNode.getClientRects()[0].x <= 150) {
      const date = dayjs().set('day', value);
      onActive(date);
    }
  }, [dayNode, onActive, value]);

  const getHour = hour => {
    return dayjs()
      .set('day', value)
      .set('hour', hour)
      .format(am ? 'h a' : 'H');
  };

  return (
    <div className={style.timeBarWeekDay} ref={ref}>
      <div className={style.timeBarDay}>
        {[...Array((60 / interval) * 24)].map((_, index) => {
          return (
            <div
              key={`hour-${shortid.generate()}`}
              className={style.timeBarSlot}
            >
              {getHour(index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

Day.propTypes = {
  am: PropTypes.bool,
  interval: PropTypes.number,
  onActive: PropTypes.func,
  value: PropTypes.number,
};

Day.defaultProps = {
  am: true,
  interval: 60,
  onActive: () => {},
  value: 0,
};

const Timebar = ({ am, dayCount, interval, onActiveDay }) => {
  const getDay = day => {
    return {
      key: day,
      value: dayjs()
        .add(day, 'day')
        .get('day'),
    };
  };

  const getDays = () =>
    [...Array(dayCount)].map((_, day) => getDay(day));

  return (
    <div className={style.timeBar}>
      {getDays().map(({ key, value }) => {
        return (
          <Day
            key={`day-${key}`}
            value={value}
            am={am}
            interval={interval}
            onActive={onActiveDay}
          />
        );
      })}
    </div>
  );
};

Timebar.propTypes = {
  am: PropTypes.bool,
  dayCount: PropTypes.number,
  interval: PropTypes.number.isRequired,
  onActiveDay: PropTypes.func,
};

Timebar.defaultProps = {
  am: true,
  dayCount: 2,
  onActiveDay: () => {},
};

export { Timebar as default };

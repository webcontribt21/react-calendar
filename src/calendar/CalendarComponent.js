/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import dayjs from 'dayjs';
import useInterval from '../hooks/useInterval';
import { days } from './props';
import style from './calendarComponent.module.scss';
import TimelineList from './timeline/TimelineList';

const User = ({ avatar, email, first, id, last, remediation }) => {
  const initials = `${first.substring(0, 1)}${last.substring(0, 1)}`;

  return (
    <li
      data-rh={`${first} ${last}`}
      data-rh-at="right"
      className={style.user}
    >
      {avatar !== '' ? (
        <img
          className={style.userPic}
          src={avatar}
          alt={`${first} ${last}`}
        />
      ) : (
        <span className={style.noProfileURL}>{initials}</span>
      )}

      {remediation > 0 && (
        <div className={style.badge}>{remediation}</div>
      )}
    </li>
  );
};

User.propTypes = {
  avatar: PropTypes.string,
  email: PropTypes.string.isRequired,
  first: PropTypes.string,
  id: PropTypes.number.isRequired,
  last: PropTypes.string,
  remediation: PropTypes.number,
};

User.defaultProps = {
  avatar: null,
  first: '',
  last: '',
  remediation: 0,
};

const CalendarComponent = ({ fetch, users, meetings, settings }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [timeMoved, setTimeMoved] = useState(false);
  const [x, setX] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [daysToRender, setDaysToRender] = useState(2);
  const timeSlotsRef = useRef();

  const handleMouseDown = e => {
    setIsMouseDown(true);
    setX(e.pageX - timeSlotsRef.current.offsetLeft);
    setScrollX(timeSlotsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = e => {
    if (!isMouseDown) {
      return;
    }

    e.preventDefault();

    /** scroll calculation for x-axis */
    const newX = e.pageX - timeSlotsRef.current.offsetLeft;
    const walk = (newX - x) * 3;

    // setDaysToRender(daysToRender + 1);

    const oldScrollLeft = timeSlotsRef.current.scrollLeft;

    timeSlotsRef.current.scrollLeft = scrollX - walk;

    if (oldScrollLeft >= daysToRender * 900) {
      setDaysToRender(daysToRender + 1);
    }

    setTimeMoved(true);
  };

  const calculateTickScroll = useCallback(() => {
    const { days: workingDays } = settings;

    const day = dayjs().day();
    const hrs = dayjs().hour();
    const mins = dayjs().minute();

    const daySize = 1824;
    const hourSize = 76;

    timeSlotsRef.current.scrollLeft = hourSize * hrs + mins + 16;
  }, [settings]);

  useInterval(calculateTickScroll, timeMoved ? null : 60000);

  const handleTimerOnClick = () => {
    calculateTickScroll();
    setTimeMoved(false);
  };

  useEffect(() => {
    calculateTickScroll();
  }, [calculateTickScroll, users]);

  return (
    <div className={cx(style.calendar)}>
      <ul className={style.users}>
        {users.map(user => (
          <User
            key={`user-id-${user.id}`}
            avatar={user.profileURL}
            email={user.email}
            first={user.firstName}
            id={user.id}
            last={user.lastName}
            remediation={user.remediation}
          />
        ))}
      </ul>
      <div
        className={style.timelineCol}
        ref={timeSlotsRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <TimelineList
          users={users}
          invites={meetings}
          daysToRender={daysToRender}
          endTime={settings.endTime}
          startTime={settings.startTime}
          interval={settings.interval}
          onTimerClick={handleTimerOnClick}
          isTimerCurrent={!timeMoved}
        />
      </div>
    </div>
  );
};

CalendarComponent.propTypes = {
  fetch: PropTypes.func,
  meetings: PropTypes.arrayOf(PropTypes.object),
  settings: PropTypes.shape({
    days: PropTypes.arrayOf(
      PropTypes.oneOf([...days.map(d => d.key)]),
    ),
    endTime: PropTypes.number,
    interval: PropTypes.oneOf([15, 30, 45, 60]),
    startTime: PropTypes.number,
  }),
  users: PropTypes.arrayOf(PropTypes.object),
};

CalendarComponent.defaultProps = {
  fetch: () => {},
  meetings: [],
  settings: {
    days: [],
    endTime: 17,
    interval: 60,
    startTime: 8,
  },
  users: [],
};

export default CalendarComponent;

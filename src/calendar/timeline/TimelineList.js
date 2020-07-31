import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Timebar from './Timebar';
import style from './timeline.module.scss';
import TimeIndicator from './TimeIndicator';

const Meeting = ({ title }) => {
  return <div className={style.meeting}>{title}</div>;
};

Meeting.propTypes = {
  title: PropTypes.string.isRequired,
};

const TimelineList = ({
  am,
  users,
  endTime,
  onTimerClick,
  startTime,
  isTimerCurrent,
  interval,
  invites,
  daysToRender,
}) => {
  const [activeDate, setActiveDate] = useState(null);

  const getInvitesByUserId = userId => {
    return invites.filter(user => user.user === userId);
  };

  const getInvitationByTime = (userInvites, datetime) => {
    if (userInvites && datetime) {
      const date = dayjs(datetime);

      return userInvites.find(invite => {
        const inviteTime = dayjs(dayjs.unix(invite.time));
        const minDiff = date.diff(inviteTime, 'minute');

        return minDiff >= 0 && minDiff <= 60;
      });
    }

    return [];
  };

  return (
    <div className={style.timeline}>
      <TimeIndicator
        onClick={onTimerClick}
        on={isTimerCurrent}
        date={activeDate}
      />
      <Timebar
        am={am}
        dayCount={daysToRender}
        interval={interval}
        onActiveDay={setActiveDate}
      />

      {users.map(user => {
        const userInvites = getInvitesByUserId(user.id);

        return (
          <div
            key={`timeslot-${Math.random()}`}
            className={style.timeBoxes}
          >
            {[...Array(daysToRender)].map((__, day) => {
              return [...Array((60 / interval) * 24)].map(
                (_, hour) => {
                  const time = dayjs()
                    .add(day, 'day')
                    .hour(hour, 'hour');
                  const diff = getInvitationByTime(userInvites, time);

                  return (
                    <div
                      key={`${Math.random()}`}
                      className={style.timeBox}
                    >
                      {diff && <Meeting title={diff.meeting.title} />}
                    </div>
                  );
                },
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

TimelineList.propTypes = {
  am: PropTypes.bool,
  daysToRender: PropTypes.number,
  endTime: PropTypes.number,
  interval: PropTypes.oneOf([15, 30, 60]).isRequired,
  invites: PropTypes.arrayOf(PropTypes.object),
  isTimerCurrent: PropTypes.bool,
  onTimerClick: PropTypes.func,
  startTime: PropTypes.number,
  users: PropTypes.arrayOf(PropTypes.object),
};

TimelineList.defaultProps = {
  am: true,
  daysToRender: 2,
  endTime: 0,
  invites: [],
  isTimerCurrent: false,
  onTimerClick: e => {},
  startTime: 0,
  users: [],
};

export { TimelineList as default };

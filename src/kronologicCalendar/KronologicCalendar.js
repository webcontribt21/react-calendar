import React, {
  useEffect,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import Icon from '@mdi/react';
import { mdiTimer, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { AuthContext } from '../auth/AuthContextService';
import { get, post } from '../utils/fetch';
import withParameters from '../utils/url';
import style from './style.module.scss';
import useInterval from '../hooks/useInterval';
import API from '../props';
import { formatCurrency } from '../utils/format';
import Button from '../components/button/Button';
import Scheduling from './scheduling/Scheduling';
import InviteHistory from './invite/Invite';

dayjs.extend(weekday);

const weekDays = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const days = {
  F: weekDays[5],
  M: weekDays[1],
  SA: weekDays[6],
  SU: weekDays[0],
  T: weekDays[2],
  TH: weekDays[4],
  W: weekDays[3],
};

function TimeSlotCell({ interval }) {
  const { ham, hour, min } = interval;

  if (min !== '0') {
    return (
      <div
        className={cx(style.slotCell, style.timeSlot, style.minutes)}
      />
    );
  }

  return (
    <div className={cx(style.slotCell, style.timeSlot)}>{ham}</div>
  );
}

TimeSlotCell.propTypes = {
  interval: PropTypes.objectOf(PropTypes.any),
};

TimeSlotCell.defaultProps = {
  interval: {},
};

function Invite({ data, index, calendarSettings, minute, onClick }) {
  if (!data) {
    return null;
  }

  const {
    contact,
    cost,
    duration,
    name,
    eventStart,
    needsIntervention,
    status,
  } = data;

  const timeFrom = dayjs(eventStart).format('h:mm a');
  const timeTo = dayjs(eventStart)
    .add(duration, 'minute')
    .format('h:mm a');
  const inviteMinute = dayjs(eventStart).minute();
  const top = inviteMinute - minute;

  const getContact = () => {
    if (contact) {
      const {
        contact: { firstName: first, lastName: last, profileURL },
      } = data;

      const initials = `${first.substring(0, 1)}${last.substring(
        0,
        1,
      )}`;

      return (
        <div
          className={style.profileURL}
          data-rh={`${first} ${last}`}
          data-rh-at="bottom"
        >
          <div>{`${first} ${last}`}</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      role="button"
      onClick={onClick}
      onKeyPress={onClick}
      tabIndex={0}
      style={{
        height:
          (25 * duration) / calendarSettings.duration - index * 10,
        left: index * 10 + 1,
        top: index * 10 + (top * 25) / 15,
        zIndex: index + 1,
      }}
      className={cx(style.invitation, {
        [style.statusAccepted]: status === 'accepted',
        [style.statusWaiting]:
          status === 'waiting_for_first_response',
        [style.statusIntervention]: needsIntervention,
      })}
    >
      <div className="row">
        <section className="col-12">
          <header>
            <span>{name}</span>
            <span className={style.duration}>
              {`${timeFrom}-${timeTo}`}
            </span>
          </header>
        </section>
      </div>
      <div className="row">
        <section className="col-12">
          <div className={style.content}>
            <div className={style.contacts}>{getContact()}</div>
            <span className={style.amount}>
              {formatCurrency(cost)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

Invite.propTypes = {
  calendarSettings: PropTypes.objectOf(PropTypes.any),
  data: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number.isRequired,
  minute: PropTypes.string,
  onClick: PropTypes.func,
};

Invite.defaultProps = {
  calendarSettings: {
    duration: 0,
  },
  data: {},
  minute: '0',
  onClick: () => {},
};

const Indicator = ({ startHour, endHour }) => {
  const [currentTime, setCurrentTime] = useState(null);
  const [top, setTop] = useState(0);

  const startTime = () => {
    const time = dayjs().format('h:mm:ss');
    setCurrentTime(time);

    const currentHr = dayjs().hour();
    const currentMin = Math.ceil((dayjs().minute() * 100) / 60);

    const fromTop = (currentHr - startHour) * 100 + currentMin;
    setTop(fromTop);
  };

  useInterval(startTime, 1000);

  return (
    <div className={style.indicator} style={{ top }}>
      <div className={style.indicatorLine} />
      <span className={style.time}>{currentTime}</span>
    </div>
  );
};

Indicator.propTypes = {
  endHour: PropTypes.number.isRequired,
  startHour: PropTypes.number.isRequired,
};

const initialCalSettings = {
  duration: 15,
  endHour: 24,
  endMinutes: 0,
  startHour: 8,
  startMinutes: 0,
  weekdays: [0, 1, 2, 3, 4, 5, 6],
};

const KronologicCalendar = () => {
  const [inviteHistory, seeInviteHistory] = useState({
    isOpen: false,
  });
  const [meetings, setMeetings] = useState([]);
  const { logout, user } = useContext(AuthContext);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [modalOpen, isModalOpen] = useState(false);
  const [calSettings, setCalSettings] = useState(initialCalSettings);

  const openInviteHistory = invite => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');

    seeInviteHistory({
      invite,
      isOpen: true,
    });
  };

  const closeInviteHistory = () => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');

    seeInviteHistory({
      invite: null,
      isOpen: false,
    });
  };

  const toggleModal = useCallback(() => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');

    isModalOpen(!modalOpen);
  }, [modalOpen]);

  const fetchMeetings = useCallback(
    async userId => {
      const url = withParameters(
        API.users.meetings,
        ['start', 'end'],
        [
          dayjs()
            .startOf('week')
            .add(currentWeek, 'week')
            .format('YYYYMMDD'),
          dayjs()
            .endOf('week')
            .add(currentWeek, 'week')
            .format('YYYYMMDD'),
        ],
      );

      const res = await get(url)
        .then(r => r.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (res) {
        const userFound = res.data.filter(u => u.id === userId);
        if (userFound && userFound.length) {
          setMeetings(userFound[0].meetings);
        }
      }
    },
    [currentWeek, logout],
  );

  const fetchCalendarSettings = useCallback(async () => {
    const res = await get(API.appSettings.default)
      .then(r => r.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (res) {
      const {
        scheduler: {
          from_time_minutes: from,
          until_time_minutes: to,
          weekdays,
        },
      } = res;

      setCalSettings({
        ...calSettings,
        endHour: dayjs()
          .startOf('day')
          .minute(to)
          .hour(),
        endMinutes: dayjs()
          .startOf('day')
          .minute(to)
          .minute(),
        startHour: dayjs()
          .startOf('day')
          .minute(from)
          .hour(),
        startMinutes: dayjs()
          .startOf('day')
          .minute(from)
          .minute(),
        weekdays,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  const getCurrentDay = () => {
    return dayjs()
      .format('dddd')
      .toLowerCase();
  };

  const getTimeSlots = () => {
    let dates = [];
    let now = dayjs()
      .startOf('day')
      .hour(calSettings.startHour)
      .minute(calSettings.startMinutes)
      .second(0);
    const deadline = dayjs()
      .hour(calSettings.endHour)
      .minute(calSettings.endMinutes)
      .second(0);

    while (now.diff(deadline) < 0) {
      if (
        now.isAfter(
          dayjs(now)
            .hour(calSettings.startHour - 2)
            .minute(calSettings.duration),
        )
      ) {
        dates = [
          ...dates,
          {
            date: now.date(),
            datetime: now,
            full: now.format('h:mm a'),
            ham: now.format('h a'),
            hour: now.hour(),
            hr: now.format('h'),
            min: now.format('m'),
          },
        ];
      }

      now = now.add(calSettings.duration, 'minutes');
    }

    return dates;
  };

  function SlotCell({ current, invites, minute, shadow }) {
    return (
      <div
        className={cx(style.slotCell, {
          [style.currentDay]: current,
          [style.shadow]: shadow,
        })}
      >
        {!!invites.length &&
          invites.map((invite, i) => (
            <Invite
              onClick={() => openInviteHistory(invite)}
              calendarSettings={calSettings}
              index={i}
              key={`invite-${invite.id}`}
              data={invite}
              minute={minute}
            />
          ))}
      </div>
    );
  }

  SlotCell.propTypes = {
    current: PropTypes.bool,
    invites: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    minute: PropTypes.string,
    shadow: PropTypes.bool,
  };

  SlotCell.defaultProps = {
    current: false,
    invites: [],
    minute: '0',
    shadow: false,
  };

  useEffect(() => {
    const { user_details: userDetails } = user();

    if (userDetails) {
      fetchMeetings(userDetails.id);
      fetchCalendarSettings();
    }
  }, [fetchCalendarSettings, fetchMeetings, user]);

  const getWeekDays = () => {
    const calcWeekdays = Object.values(weekDays).map((_, i) => {
      const day = dayjs()
        .startOf('week')
        .add(i, 'day')
        .add(currentWeek, 'week');

      return {
        d: day.format('D'),
        date: day.format('DD'),
        weekday: day.format('ddd'),
      };
    });

    return calcWeekdays;
  };

  const nextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  const prevWeek = () => {
    setCurrentWeek(currentWeek - 1);
  };

  return (
    <section id="kronologic-calendar" className={cx(style.calendar)}>
      <InviteHistory
        isOpen={inviteHistory.isOpen}
        onClose={closeInviteHistory}
        data={inviteHistory.invite}
      />
      <Scheduling isOpen={modalOpen} onClose={toggleModal} />
      <section className={style.kronos}>
        <header>
          <div className={style.weekday}>
            <div className={style.content}>
              <Button type="text" onClick={toggleModal}>
                <Icon path={mdiTimer} size={1} />
              </Button>
            </div>
          </div>
          {getWeekDays().map((wd, i) => (
            <div className={style.weekday} key={`day-${wd.date}`}>
              {i === 0 && (
                <Button
                  icon={mdiChevronLeft}
                  type="text"
                  onClick={prevWeek}
                />
              )}
              <div className={style.content}>
                <span className={style.date}>{wd.d}</span>
                <span className={style.day}>{wd.weekday}</span>
              </div>
              {i === 6 && (
                <Button
                  icon={mdiChevronRight}
                  type="text"
                  onClick={nextWeek}
                />
              )}
            </div>
          ))}
        </header>
        <div className={style.slots}>
          <Indicator
            startHour={calSettings.startHour}
            endHour={calSettings.endHour}
          />
          {getTimeSlots().map(interval => {
            const { date, datetime, hour, min } = interval;

            const invitationsByInterval = meetings?.filter(fi => {
              return (
                dayjs(fi.eventStart).hour() === parseInt(hour, 10) &&
                dayjs(fi.eventStart).minute() >= parseInt(min, 10) &&
                dayjs(fi.eventStart).minute() <
                  parseInt(min, 10) + calSettings.duration
              );
            });
            let byDay = invitationsByInterval?.map(i => {
              const day = dayjs(i.eventStart)
                .format('dddd')
                .toLowerCase();
              const eventDate = dayjs(i.eventStart)
                .format('DD')
                .toLowerCase();

              return {
                date: eventDate,
                day,
                invite: i,
              };
            });

            // TODO duplicate invites
            /**
             * have a backend issue when getting duplicate invtes (same id and data)
             * for now, UI will hide duplicate invites.
             */
            byDay = byDay.filter(
              (day, index, self) =>
                index === self.findIndex(t => t.id === day.id),
            );

            const weekdays = getWeekDays();

            // TODO refactor this :(
            return (
              <div
                className={style.slot}
                key={`time-slot-${interval.full}`}
              >
                <TimeSlotCell interval={interval} />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.SU &&
                        d.date === weekdays[0].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.SU}
                  shadow={!calSettings.weekdays.includes(0)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.M &&
                        d.date === weekdays[1].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.M}
                  shadow={!calSettings.weekdays.includes(1)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.T &&
                        d.date === weekdays[2].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.T}
                  shadow={!calSettings.weekdays.includes(2)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.W &&
                        d.date === weekdays[3].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.W}
                  shadow={!calSettings.weekdays.includes(3)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.TH &&
                        d.date === weekdays[4].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.TH}
                  shadow={!calSettings.weekdays.includes(4)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.F &&
                        d.date === weekdays[5].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.F}
                  shadow={!calSettings.weekdays.includes(5)}
                />
                <SlotCell
                  minute={min}
                  invites={byDay
                    ?.filter(
                      d =>
                        d.day === days.SA &&
                        d.date === weekdays[6].date,
                    )
                    ?.map(i => i.invite)}
                  current={getCurrentDay() === days.SA}
                  shadow={!calSettings.weekdays.includes(6)}
                />
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default KronologicCalendar;

import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import dayjs from 'dayjs';
import CalendarComponent from './CalendarComponent';
import { get, post } from '../utils/fetch';
import withParameters from '../utils/url';
import style from './calendar.module.scss';
import API from '../props';

const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const fetchUsers = async () => {
    const res = await get(API.users.default()).then(r => r.json());
    setUsers(res.data);
  };

  const fetchMeetings = async day => {
    const url = withParameters(
      API.users.meetings,
      ['start', 'end'],
      [dayjs(day).format('YYYYMMDD'), dayjs(day).format('YYYYMMDD')],
    );
    const res = await get(url).then(r => r.json());
    setMeetings(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchMeetings(dayjs());
  }, []);

  return (
    <section id="kronologic-calendar" className={cx(style.calendar)}>
      <CalendarComponent
        fetch={fetchMeetings}
        users={users}
        meetings={meetings}
      />
    </section>
  );
};

export default Calendar;

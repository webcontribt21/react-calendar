/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import dayjs from 'dayjs';
import Range from 'rc-slider/lib/Range';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { get, patch, post } from '../../utils/fetch';
import API from '../../props';

ReactModal.setAppElement('#kronologic-ai-app');

const weekDays = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const Scheduling = ({ isOpen, onClose, onSuccess }) => {
  const [settings, setSettings] = useState(null);

  const getWeekDays = () => {
    if (settings?.scheduler?.weekdays) {
      return Object.values(weekDays).map((_, i) => {
        const day = dayjs()
          .startOf('week')
          .add(i, 'day');

        return {
          active: settings.scheduler.weekdays.includes(i),
          day: day.day(),
          dd: day.format('dd'),
        };
      });
    }

    return [];
  };

  const fetchSettings = useCallback(async () => {
    const res = await get(API.appSettings.default).then(r =>
      r.json(),
    );

    if (res) {
      setSettings(res);
    }
  }, []);

  const setDay = async (weekDay, active) => {
    if (settings?.scheduler?.weekdays) {
      let weekdays = [...settings.scheduler.weekdays];

      if (active) {
        weekdays = [...weekdays, weekDay];
      } else {
        weekdays = weekdays.filter(wd => wd !== weekDay);
      }

      const res = await patch(API.appSettings.default, null, {
        ...settings,
        scheduler: {
          ...settings.scheduler,
          weekdays,
        },
      }).then(r => r.json());

      if (res) {
        setSettings({
          ...settings,
          scheduler: {
            ...settings.scheduler,
            weekdays,
          },
        });
      }
    }
  };

  const setTime = async time => {
    const res = await patch(API.appSettings.default, null, {
      ...settings,
      scheduler: {
        ...settings.scheduler,
        from_time_minutes: time[0],
        until_time_minutes: time[1],
      },
    }).then(r => r.json());

    if (res) {
      setSettings({
        ...settings,
        scheduler: {
          ...settings.scheduler,
          from_time_minutes: time[0],
          until_time_minutes: time[1],
        },
      });
    }
  };

  const getAvailability = () => {
    if (settings) {
      const from = dayjs()
        .startOf('day')
        .minute(settings.scheduler.from_time_minutes)
        .format('h:mm a');
      const to = dayjs()
        .startOf('day')
        .minute(settings.scheduler.until_time_minutes)
        .format('h:mm a');

      return <span>{`${from}-${to}`}</span>;
    }

    return null;
  };

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [fetchSettings, settings]);

  useEffect(() => {
    if (!isOpen) {
      setSettings(null);
    }
  }, [isOpen]);

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal--content"
      overlayClassName="modal--overlay"
      shouldCloseOnOverlayClick={false}
    >
      <section
        className={cx('container is--fluid', style.scheduling)}
      >
        <div className="row">
          <div className="col-1 col-offset-9">
            <Icon
              path={mdiClose}
              size={2}
              className={style.close}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-3 col-offset-4">
            <Card>
              <div className={style.settings}>
                <div className="row">
                  <div className={cx('col-12', style.days)}>
                    {getWeekDays().map(d => (
                      <Button
                        key={`day-${d.dd}`}
                        type="text"
                        onClick={() => setDay(d.day, !d.active)}
                      >
                        <span
                          className={cx({ [style.active]: d.active })}
                        >
                          {d.dd}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <div className={cx('col-12', style.time)}>
                    {settings && (
                      <label>
                        <span>Your time</span>
                        <Range
                          onAfterChange={setTime}
                          allowCross={false}
                          step={60}
                          min={60}
                          max={1440}
                          defaultValue={[
                            settings.scheduler.from_time_minutes,
                            settings.scheduler.until_time_minutes,
                          ]}
                        />
                        <span>{getAvailability()}</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

Scheduling.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

Scheduling.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};

export { Scheduling as default };

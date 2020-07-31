/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { mdiCalendarCheckOutline, mdiTrashCanOutline } from '@mdi/js';
import NProgress from 'nprogress';
import API from '../../props';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Switch from '../../components/switch/Switch';
import { patch } from '../../utils/fetch';
import { AuthContext } from '../../auth/AuthContextService';
import { useToasts } from '../../hooks/notifications/notifications';
import Button from '../../components/button/Button';

NProgress.configure({
  parent: '#meetingMgmt',
});

const MeetingItem = ({
  data,
  selected,
  onClick,
  onToggle,
  onDelete,
}) => {
  const [enabled, isEnabled] = useState(data.active);
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();

  /**
   * @function
   * updateContact
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   */
  const updateChannel = useCallback(
    async isActive => {
      const response = await patch(
        API.meetings.default(data.id),
        null,
        {
          enabled: isActive,
        },
      ).catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

      if (response.ok) {
        add('Meeting updated', mdiCalendarCheckOutline);
      }
    },
    [add, data.id, logout],
  );

  const toggleActive = useCallback(() => {
    const isActive = !enabled;
    isEnabled(isActive);
    onToggle(isActive);

    if (data.id && Number.isInteger(data.id)) {
      updateChannel(isActive);
    }
  }, [data.id, enabled, onToggle, updateChannel]);

  const Header = () => {
    let trimmedName = data.name;

    if (trimmedName.length > 10) {
      trimmedName = `${trimmedName.substring(0, 10)}...`;
    }

    return (
      <div
        className={cx(style.modalHeader, {
          [style.selected]: selected,
        })}
      >
        <span>{trimmedName}</span>
        <div className={style.headerActions}>
          <Switch
            size="small"
            isOn={!!enabled}
            handleToggle={toggleActive}
          />
        </div>
        <Button
          icon={mdiTrashCanOutline}
          type="tertiary"
          onClick={onDelete}
        />
      </div>
    );
  };

  if (onClick) {
    return (
      <div
        tabIndex={0}
        role="button"
        aria-pressed={false}
        onClick={onClick}
        onKeyPress={onClick}
        className={[style.meetingItem]}
      >
        <Card header={<Header />} />
      </div>
    );
  }

  return <Card header={<Header />} className={[style.meetingItem]} />;
};

MeetingItem.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onToggle: PropTypes.func,
  selected: PropTypes.bool,
};

MeetingItem.defaultProps = {
  onClick: () => {},
  onDelete: () => {},
  onToggle: () => {},
  selected: false,
};

export { MeetingItem as default };

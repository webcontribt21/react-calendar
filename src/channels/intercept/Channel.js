/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  mdiAccountAlertOutline,
  mdiArrowDecisionOutline,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import API from '../../props';
import style from './style.module.scss';
import { patch, del } from '../../utils/fetch';
import { AuthContext } from '../../auth/AuthContextService';
import Card from '../../components/card/Card';
import { useToasts } from '../../hooks/notifications/notifications';

import hubspotImg from '../../assets/hubspot.png';
import salesforceImg from '../../assets/salesforce.svg';
import zapierImg from '../../assets/zapier.png';
import Button from '../../components/button/Button';

const integrationTypes = {
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  ZAPIER: 'zapier',
};

const integrationImgSrc = {
  [integrationTypes.HUBSPOT]: hubspotImg,
  [integrationTypes.SALESFORCE]: salesforceImg,
  [integrationTypes.ZAPIER]: zapierImg,
};

const Channel = ({ data, onClick, onRemove }) => {
  const [enabled, isEnabled] = useState(data.enabled);
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
    async active => {
      const response = await patch(
        API.channels.default(data.id),
        null,
        {
          enabled: active,
        },
      ).catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

      if (response.ok) {
        add('Channel updated', mdiAccountAlertOutline);
      }
    },
    [add, data.id, logout],
  );

  const removeChannel = useCallback(async () => {
    const response = await del(API.channels.default(data.id)).catch(
      e => {
        if (e.message === '401') {
          logout();
        }
      },
    );

    if (response.ok) {
      add('Channel removed', mdiAccountAlertOutline);
      onRemove();
    }
  }, [add, data.id, logout, onRemove]);

  const toggleActive = useCallback(() => {
    const active = !enabled;
    isEnabled(active);
    updateChannel(active);
  }, [enabled, updateChannel]);

  const handleOnClick = () => onClick(data);
  const Header = () => (
    <div className={style.modalHeader}>
      <img
        src={integrationImgSrc[data.integration.name]}
        alt={data.integration.name}
      />
      <span>{data.name}</span>
      <div className={style.headerActions}>
        <Button
          type="text"
          icon={mdiPencil}
          onClick={handleOnClick}
        />
        <Button
          type="text"
          icon={mdiTrashCanOutline}
          onClick={removeChannel}
        />
      </div>
    </div>
  );

  return (
    <Card type="dark" header={<Header />} className={[style.channel]}>
      {data.description}
    </Card>
  );
};

Channel.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};

Channel.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
};

export { Channel as default };

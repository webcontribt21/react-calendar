import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import cx from 'classnames';
import {
  mdiPlus,
  mdiGaugeEmpty,
  mdiArrowDecisionOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import API from '../../props';
import style from './style.module.scss';
import { get } from '../../utils/fetch';
import { AuthContext } from '../../auth/AuthContextService';
import { EmptyView } from '../../components/genericView/GenericView';
import Button from '../../components/button/Button';
import { useToasts } from '../../hooks/notifications/notifications';
import Add from './add/Add';
import Update from './update/Update';

const Channel = lazy(() => import('./Channel'));

const Import = () => {
  const [channels, setChannels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();

  const fetchChannels = useCallback(async () => {
    const response = await get(API.channels.import())
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response && response.length) {
      setChannels(response);
    }
  }, [logout]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const toggleModal = useCallback(
    event => {
      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');
      setIsModalOpen(!isModalOpen);
    },
    [isModalOpen],
  );

  const toggleUpdate = useCallback(
    channel => {
      if (channel) {
        setChannelId(channel.id);
      }

      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');
      setIsToggleModalOpen(!isToggleModalOpen);
    },
    [isToggleModalOpen],
  );

  const onCreateChannel = useCallback(() => {
    toggleModal();
    fetchChannels();
    add('Channel created', mdiArrowDecisionOutline);
  }, [add, fetchChannels, toggleModal]);

  const onUpdate = useCallback(() => {
    toggleUpdate(false);
    fetchChannels();
    add('Channel updated', mdiArrowDecisionOutline);
  }, [add, fetchChannels, toggleUpdate]);

  const onRemove = useCallback(() => {
    fetchChannels();
    add('Channel removed', mdiArrowDecisionOutline);
  }, [add, fetchChannels]);

  return (
    <div className={style.channels}>
      <Add
        isOpen={isModalOpen}
        onChannelAdded={onCreateChannel}
        onClose={toggleModal}
      />
      <Update
        channelId={channelId}
        isOpen={isToggleModalOpen}
        onClose={toggleUpdate}
        onUpdate={onUpdate}
      />
      <div className="row">
        <div className="col-12">
          {!channels.length && (
            <EmptyView
              icon={mdiGaugeEmpty}
              view="channels"
              actions={[
                <Button
                  key="actions-add-team"
                  icon={mdiPlus}
                  onClick={toggleModal}
                >
                  <span>Add Channel</span>
                </Button>,
              ]}
            />
          )}
          {channels.length > 0 && (
            <>
              <div className="row">
                <div className={cx('col-12', style.channelContainer)}>
                  <Suspense fallback={<span />}>
                    {channels.map(channel => {
                      return (
                        <Channel
                          key={`channel-${channel.id}`}
                          data={channel}
                          onClick={toggleUpdate}
                          onRemove={onRemove}
                        />
                      );
                    })}
                  </Suspense>
                  <Button type="tertiary" onClick={toggleModal}>
                    <Icon
                      path={mdiPlus}
                      size={2}
                      className={style.close}
                    />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Import as default };

/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { get } from '../../utils/fetch';
import API from '../../props';
import { formatCurrency } from '../../utils/format';

ReactModal.setAppElement('#kronologic-ai-app');

const noteTypes = {
  ai_reponse: 'A.I. Response',
  contact_reply: 'Contact Reply',
  system_note: 'System Note',
  touch_sent: 'Touch Sent',
};

const Invite = ({ isOpen, onClose, onSuccess, data }) => {
  const [inviteHistory, setInviteHistory] = useState(null);

  const fetchInviteHistory = useCallback(async () => {
    const res = await get(API.meetings.history(data.id)).then(r =>
      r.json(),
    );

    if (res) {
      setInviteHistory(res);
    }
  }, [data]);

  const getContact = () => {
    if (data.contact) {
      const {
        contact: { firstName: first, lastName: last, profileURL },
      } = data;

      const initials = `${first.substring(0, 1)}${last.substring(
        0,
        1,
      )}`;

      return (
        <div className={style.profileURL}>
          {profileURL !== '' && (
            <img src={profileURL} alt={`${first} ${last}`} />
          )}
          {!profileURL && (
            <span className={style.noProfileURL}>{initials}</span>
          )}
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    if (!inviteHistory && isOpen) {
      fetchInviteHistory();
    }
  }, [data, fetchInviteHistory, inviteHistory, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setInviteHistory(null);
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
      <section className={cx('container is--fluid')}>
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
          <div className="col-6 col-offset-3">
            {data && inviteHistory && (
              <Card>
                <div className={style.inviteHistory}>
                  <div className="row">
                    <div className={cx('col-4')}>
                      <div className={style.invite}>
                        <h3>{data.name}</h3>
                        <span className={style.location}>
                          {data.location}
                        </span>
                      </div>
                    </div>
                    <div className={cx('col-4')}>{getContact()}</div>
                    <div className={cx('col-4')}>
                      <h3 className={style.cost}>
                        {formatCurrency(data.cost)}
                      </h3>
                    </div>
                  </div>
                  <div className={style.history}>
                    {inviteHistory.map(note => {
                      return (
                        <div
                          key={`notes-${note.occurrence}`}
                          className={style.note}
                        >
                          <div className={style.timeline}>
                            <div className={style.line} />
                            <div className={style.dot} />
                          </div>
                          <div className={style.type}>
                            {noteTypes[note.notes.note_type]}
                          </div>
                          <div className={style.content}>
                            {note.notes.note}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

Invite.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

Invite.defaultProps = {
  data: null,
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};

export { Invite as default };

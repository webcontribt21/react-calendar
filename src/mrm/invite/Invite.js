/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import relativeTime from 'dayjs/plugin/relativeTime';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { get } from '../../utils/fetch';
import API from '../../props';

dayjs.extend(relativeTime);

ReactModal.setAppElement('#kronologic-ai-app');

const statusMappings = {
  accepted: 'Accepted',
  cancelled: 'cancelled',
  declined: 'Declined',
  initialized: 'Initalized',
  negotiation_in_progress: 'A.I. in Progress',
  requires_user_intervention: 'Requires User Intervention',
  system_note: 'System Note',
  waiting_for_first_response: 'Pending',
};

const contactResponses = ['contact_reply'];
const systemResponses = ['system_note'];
const AIResponses = ['ai_reponse', 'touch_sent'];

const Invite = ({ isOpen, onClose, onSuccess, data }) => {
  const [inviteHistory, setInviteHistory] = useState(null);

  const fetchInviteHistory = useCallback(async () => {
    const res = await get(API.meetings.history(data.value)).then(r =>
      r.json(),
    );

    if (res) {
      const invites = [...res].sort((d1, d2) => {
        return dayjs(d1.occurrence) - dayjs(d2.occurrence);
      });
      setInviteHistory(invites);
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
          <div className="col-4 col-offset-4">
            {data && inviteHistory && (
              <Card contentClassName={style.history}>
                <div className={style.conversation}>
                  <ul className={style.notes}>
                    {inviteHistory.map(history => {
                      const {
                        occurrence,
                        status,
                        notes: { note, note_type: type },
                      } = history;
                      const sanitizer = DOMPurify.sanitize;

                      return (
                        <li
                          key={`notes-${occurrence}`}
                          className={cx({
                            [style.left]: contactResponses.includes(
                              type,
                            ),
                            [style.right]: AIResponses.includes(type),
                          })}
                        >
                          {!systemResponses.includes(type) && (
                            <div
                              className={cx([style.email], {
                                [style.left]: contactResponses.includes(
                                  type,
                                ),
                                [style.right]: AIResponses.includes(
                                  type,
                                ),
                              })}
                            >
                              {contactResponses.includes(type)
                                ? data.contact
                                : data.user}
                            </div>
                          )}
                          <div
                            className={cx([style.msg], {
                              [style.left]: contactResponses.includes(
                                type,
                              ),
                              [style.right]: AIResponses.includes(
                                type,
                              ),
                              [style.system]: systemResponses.includes(
                                type,
                              ),
                            })}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                              __html: sanitizer(note),
                            }}
                          />
                          <div
                            className={cx([style.time], {
                              [style.left]: contactResponses.includes(
                                type,
                              ),
                              [style.right]: AIResponses.includes(
                                type,
                              ),
                            })}
                          >
                            {`${statusMappings[status]} - ${dayjs(
                              occurrence,
                            ).fromNow()}`}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
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

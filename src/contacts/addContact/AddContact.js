/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiAccountPlusOutline,
  mdiPlus,
  mdiCheck,
} from '@mdi/js';
import style from './style.module.scss';
import { AuthContext } from '../../auth/AuthContextService';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { get, post, patch } from '../../utils/fetch';
import API from '../../props';
import useInput from '../../hooks/useInput';

ReactModal.setAppElement('#kronologic-ai-app');

const AddContact = ({ isOpen, onClose, onContactAdded, contact }) => {
  const { values, bind, reset, setValues } = useInput({});
  const [meetingDefs, setMeetingDefs] = useState([]);
  const { logout } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    if (contact && contact.id) {
      setValues({
        ...contact,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const addContact = async () => {
    if (contact?.id) {
      const {
        id,
        x,
        email,
        meetings: m,
        profilePic,
        ...rest
      } = values;
      const response = await patch(
        API.contacts.default(contact.id),
        null,
        rest,
      ).then(res => res);

      if (response && response.ok) {
        onContactAdded(rest, 'contact updated successfully.');
      }
    } else {
      const newContact = {
        ...values,
        tagIds: meetingDefs,
      };
      const response = await post(
        API.contacts.default(),
        null,
        newContact,
      ).then(res => res);

      if (response && response.ok) {
        onContactAdded(newContact);
      }
    }
  };

  const fetchMeetings = useCallback(async () => {
    const response = await get(API.meetings.default())
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response && response.data) {
      setMeetings(response.data);
    }
  }, [logout]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const selectMeetingDefs = useCallback(defs => {
    setMeetingDefs(defs.map(t => t.id));
  }, []);

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
        className={cx('container is--fluid', style.addContactsModal)}
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
          <div className="col-5 col-offset-4">
            <Card
              icon={mdiAccountPlusOutline}
              header={contact?.id ? 'Update Contact' : 'Add Contact'}
            >
              <form>
                <div className="row">
                  <div className="col-6">
                    <label htmlFor="email">
                      <input
                        placeholder="Email"
                        type="email"
                        name="email"
                        value={values.email}
                        {...bind}
                      />
                    </label>
                    <label htmlFor="firstName">
                      <input
                        placeholder="First name"
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        {...bind}
                      />
                    </label>
                    <label htmlFor="lastName">
                      <input
                        placeholder="Last name"
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        {...bind}
                      />
                    </label>
                    <label htmlFor="phone">
                      <input
                        placeholder="Phone number"
                        type="text"
                        name="phone"
                        value={values.phone}
                        {...bind}
                      />
                    </label>
                  </div>
                  <div className="col-6">
                    <label htmlFor="address">
                      <input
                        placeholder="Address"
                        type="text"
                        name="address"
                        value={values.address}
                        {...bind}
                      />
                    </label>
                    <label htmlFor="account">
                      <input
                        placeholder="Account"
                        type="text"
                        name="account"
                        value={values.account}
                        {...bind}
                      />
                    </label>
                    <div className="form--inline">
                      <label htmlFor="zip">
                        <input
                          placeholder="Zip code"
                          type="text"
                          name="zip"
                          className="fluid"
                          value={values.zip}
                          {...bind}
                        />
                      </label>
                      <label htmlFor="state">
                        <input
                          placeholder="State"
                          type="text"
                          name="state"
                          className="fluid"
                          value={values.state}
                          {...bind}
                        />
                      </label>
                    </div>
                    <div className="form--inline">
                      <label htmlFor="leadScore">
                        <input
                          placeholder="Lead score"
                          type="text"
                          name="leadScore"
                          className="fluid"
                          value={values.leadScore}
                          {...bind}
                        />
                      </label>
                      <label htmlFor="logicField">
                        <input
                          placeholder="Logic field"
                          type="text"
                          name="logicField"
                          className="fluid"
                          value={values.logicField}
                          {...bind}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div
                    className={cx(
                      'col-4 col-offset-8',
                      style.actions,
                    )}
                  >
                    <Button
                      icon={contact?.id ? mdiCheck : mdiPlus}
                      type="primary"
                      onClick={addContact}
                    >
                      <span>{contact?.id ? 'Update' : 'Add'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

AddContact.propTypes = {
  contact: PropTypes.objectOf(PropTypes.any),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onContactAdded: PropTypes.func,
};

AddContact.defaultProps = {
  contact: null,
  isOpen: false,
  onClose: () => {},
  onContactAdded: () => {},
};

export { AddContact as default };

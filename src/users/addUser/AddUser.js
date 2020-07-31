/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose, mdiAccountPlusOutline, mdiPlus } from '@mdi/js';
import Select from 'react-dropdown-select';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { post } from '../../utils/fetch';
import API from '../../props';
import useInput from '../../hooks/useInput';
import Switch from '../../components/switch/Switch';

ReactModal.setAppElement('#kronologic-ai-app');

const AddUser = ({ isOpen, onClose }) => {
  const { values, bind, reset } = useInput({});
  const [teams, setTeams] = useState([]);
  const [active, setActive] = useState(false);

  const addUser = () => {
    post(API.users.default(), null, { ...values, active, teams });
  };

  const addTeams = useCallback(addedTeams => {
    setTeams(addedTeams.map(t => t.name));
  }, []);

  const toggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiAccountPlusOutline} size={3} />
        <span>Add User</span>
        <div className={style.headerActions}>
          <span>activate</span>
          <Switch isOn={active} handleToggle={toggleActive} />
        </div>
      </div>
    );
  };

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
          <div className="col-6 col-offset-3">
            <Card header={<ModalHeader />}>
              <form>
                <div className="row">
                  <div className="col-6">
                    <label htmlFor="email">
                      Email
                      <input type="email" name="email" {...bind} />
                    </label>
                    <label htmlFor="firstName">
                      First name
                      <input type="text" name="firstName" {...bind} />
                    </label>
                    <label htmlFor="lastName">
                      Last name
                      <input type="text" name="lastName" {...bind} />
                    </label>
                  </div>
                  <div className="col-6">
                    <label htmlFor="phone">
                      Phone
                      <input type="text" name="phone" {...bind} />
                    </label>
                    <div className="form--inline">
                      <label htmlFor="zip">
                        Zip code
                        <input
                          type="text"
                          name="zip"
                          className="fluid"
                          {...bind}
                        />
                      </label>
                      <label htmlFor="state">
                        State
                        <input
                          type="text"
                          name="state"
                          className="fluid"
                          {...bind}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <hr />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="tags" className={style.tagLbl}>
                      <span>Teams</span>
                      <Select
                        multi
                        searchable
                        name="tags"
                        addPlaceholder="+ team"
                        labelField="name"
                        valueField="name"
                        searchBy="name"
                        clearable={false}
                        options={[
                          {
                            name: 'Awesome Team',
                          },
                          {
                            name: 'Great Team',
                          },
                        ]}
                        onChange={addTeams}
                      />
                    </label>
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
                      icon={mdiPlus}
                      type="primary"
                      onClick={addUser}
                    >
                      <span>Add User</span>
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

AddUser.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

AddUser.defaultProps = {
  isOpen: false,
  onClose: () => {},
};

export { AddUser as default };

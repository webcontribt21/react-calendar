/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiAccountMultipleOutline,
  mdiCheck,
  mdiPlus,
} from '@mdi/js';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { post } from '../../utils/fetch';
import API from '../../props';
import useInput from '../../hooks/useInput';

ReactModal.setAppElement('#kronologic-ai-app');

const AddTeam = ({ isOpen, onClose, onSuccess }) => {
  const { values, bind, reset } = useInput({});

  const addTeam = async () => {
    const response = await post(API.teams.default(), null, {
      ...values,
    });

    if (response) {
      onSuccess();
    }
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
          <div className="col-3 col-offset-5">
            <Card icon={mdiAccountMultipleOutline} header="Add Team">
              <div className="row">
                <div className="col-12">
                  <label htmlFor="firstName">
                    <input
                      type="text"
                      name="name"
                      {...bind}
                      placeholder="Team name"
                    />
                  </label>
                </div>
              </div>

              <div className="row">
                <div
                  className={cx('col-4 col-offset-8', style.actions)}
                >
                  <Button
                    icon={mdiPlus}
                    type="primary"
                    onClick={addTeam}
                  >
                    <span>Team</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

AddTeam.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

AddTeam.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};

export { AddTeam as default };

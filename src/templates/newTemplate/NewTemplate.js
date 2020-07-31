/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiCheck,
  mdiCursorText,
  mdiTriangleOutline,
  mdiEmailPlusOutline,
} from '@mdi/js';
import { AuthContext } from '../../auth/AuthContextService';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import useInput from '../../hooks/useInput';
import { post } from '../../utils/fetch';
import API from '../../props';
import TextEditor from '../../components/textEditor/TextEditor';
import Dropdown from '../../components/dropdown/Dropdown';

ReactModal.setAppElement('#kronologic-ai-app');

const templateTypes = {
  EMAIL: 'email',
  INVITE: 'invite',
};

const NewTemplate = ({ isOpen, onClose, onSuccess, fields }) => {
  const { values, bind } = useInput({});
  const { logout } = useContext(AuthContext);
  const [type, setType] = useState(templateTypes.EMAIL);
  const [body, setBody] = useState(false);

  const add = useCallback(async () => {
    const response = await post(API.templates[type].default(), null, {
      ...(type === templateTypes.INVITE ? { notes: body } : { body }),
      ...values,
    })
      .then(res => res)
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response.ok) {
      onSuccess(values.name);
    }
  }, [body, logout, onSuccess, type, values]);

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
        className={cx('container is--fluid', style.applyTagsModal)}
      >
        <div className="row">
          <div className="col-1 col-offset-10">
            <Icon
              path={mdiClose}
              size={2}
              className={style.close}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-3 col-offset-1">
            <Card icon={mdiCursorText} header="custom fields">
              <div className={style.fields}>
                {fields.map(field => {
                  return (
                    <Button
                      icon={mdiTriangleOutline}
                      type="secondary"
                    >
                      <span>{field.field}</span>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
          <div className="col-6">
            <Card header="New Template" icon={mdiEmailPlusOutline}>
              <form>
                <div className="row">
                  <div className="col-12">
                    <div className="form--inline">
                      <label htmlFor="name">
                        Name
                        <input
                          type="text"
                          name="name"
                          className="fluid"
                          {...bind}
                        />
                      </label>
                      {type === templateTypes.INVITE && (
                        <label htmlFor="location">
                          Location
                          <input
                            type="text"
                            name="location"
                            className="fluid"
                            {...bind}
                          />
                        </label>
                      )}
                    </div>
                    <div className="form--inline">
                      <label htmlFor="title">
                        Title
                        <input
                          type="text"
                          name="title"
                          className="fluid"
                          {...bind}
                        />
                      </label>
                      <label htmlFor="type">
                        Type
                        <Dropdown
                          labelProp="value"
                          data={Object.values(templateTypes).map(
                            value => ({
                              value,
                            }),
                          )}
                          onSelect={v => setType(v.value)}
                        />
                      </label>
                    </div>
                    <label>
                      <TextEditor onChange={setBody} />
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
                      icon={mdiCheck}
                      type="primary"
                      onClick={add}
                    >
                      <span>Add</span>
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

NewTemplate.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.any),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

NewTemplate.defaultProps = {
  fields: [],
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};

export { NewTemplate as default };

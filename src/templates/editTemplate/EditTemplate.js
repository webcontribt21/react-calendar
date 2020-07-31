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
  mdiEmailEditOutline,
  mdiCheck,
  mdiCursorText,
  mdiTriangleOutline,
} from '@mdi/js';
import { AuthContext } from '../../auth/AuthContextService';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { get, patch } from '../../utils/fetch';
import API from '../../props';
import TextEditor from '../../components/textEditor/TextEditor';

ReactModal.setAppElement('#kronologic-ai-app');

const EditTemplate = ({ isOpen, onClose, id, fields, type }) => {
  const { logout } = useContext(AuthContext);
  const [body, setBody] = useState(false);
  const [value, setValue] = useState(false);

  const update = useCallback(() => {
    patch(API.templates[type].default(id), null, {
      body,
    });
    onClose();
  }, [body, id, onClose, type]);

  const fetchEmailTemplate = useCallback(async () => {
    const response = await get(API.templates[type].default(id))
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      setValue(response.body);
    }
  }, [id, logout, type]);

  useEffect(() => {
    fetchEmailTemplate();
  }, [fetchEmailTemplate, id, isOpen]);

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
            <Card header="Update Template" icon={mdiEmailEditOutline}>
              <div className="row">
                <div className="col-12">
                  <label>
                    {value && (
                      <TextEditor value={value} onChange={setBody} />
                    )}
                  </label>
                </div>
              </div>

              <div className="row">
                <div
                  className={cx('col-4 col-offset-8', style.actions)}
                >
                  <Button
                    icon={mdiCheck}
                    type="primary"
                    onClick={update}
                  >
                    <span>Update</span>
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

EditTemplate.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.any),
  id: PropTypes.number,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  type: PropTypes.string.isRequired,
};

EditTemplate.defaultProps = {
  fields: [],
  id: null,
  isOpen: false,
  onClose: () => {},
};

export { EditTemplate as default };

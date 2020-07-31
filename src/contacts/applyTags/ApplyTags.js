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
import { mdiClose, mdiCalendarPlus, mdiPlus } from '@mdi/js';
import Select from 'react-dropdown-select';
import { AuthContext } from '../../auth/AuthContextService';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { get, post } from '../../utils/fetch';
import API from '../../props';
import Switch from '../../components/switch/Switch';

ReactModal.setAppElement('#kronologic-ai-app');

const ApplyTags = ({ isOpen, onClose, contactIds }) => {
  const [meetings, setMeetings] = useState([]);
  const [meetingDef, setMeetingDef] = useState(null);
  const { logout } = useContext(AuthContext);

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

  const applyTags = () => {
    const defs = contactIds.map(cid => ({
      cid: parseInt(cid, 10),
      mdid: meetingDef,
    }));

    post(API.meetings.instance, null, defs);
    onClose();
  };

  const selectMeetingDefs = useCallback(defs => {
    setMeetingDef(defs.map(t => t.id)[0]);
  }, []);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiCalendarPlus} size={3} />
        <span>Apply Meeting Definition</span>
        <div className={style.headerActions} />
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
        className={cx('container is--fluid', style.applyTagsModal)}
      >
        <div className="row">
          <div className="col-1 col-offset-8">
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
            <Card header={<ModalHeader />}>
              <form>
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="tags" className={style.tagLbl}>
                      <span>Meeting definitions</span>
                      <Select
                        searchable
                        name="meetingDefs"
                        addPlaceholder="+ meeting definition"
                        labelField="name"
                        valueField="id"
                        searchBy="name"
                        clearable={false}
                        options={meetings.map(m => ({
                          id: m.id,
                          name: m.name,
                        }))}
                        onChange={selectMeetingDefs}
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
                      onClick={applyTags}
                    >
                      <span>Apply</span>
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

ApplyTags.propTypes = {
  contactIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

ApplyTags.defaultProps = {
  isOpen: false,
  onClose: () => {},
};

export { ApplyTags as default };

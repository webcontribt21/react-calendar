/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose, mdiPlus, mdiCalendarMonthOutline } from '@mdi/js';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { post } from '../../utils/fetch';
import API from '../../props';
import useInput from '../../hooks/useInput';
import Dropdown from '../../components/dropdown/Dropdown';
import Switch from '../../components/switch/Switch';
import TemplateDnD from '../mgmt/templates/TemplateDnD';

ReactModal.setAppElement('#kronologic-ai-app');

const AddMeetingType = ({
  isOpen,
  onClose,
  distributionTypeData,
  routingTypeData,
  teams,
}) => {
  const { values, bind, reset } = useInput({});
  const [active, setActive] = useState(true);
  const [team, setTeam] = useState('');
  const [touches, setTouches] = useState([]);
  const [routingType, setRoutingType] = useState('');
  const [distributionType, setDistributionType] = useState('');
  const [canAddMeeting, setCanAddMeeting] = useState(false);
  const history = useHistory();

  useEffect(() => {
    reset();
    setTeam('');
    setRoutingType('');
    setDistributionType('');
    setActive(false);
  }, [onClose, reset]);

  const onTeamChange = useCallback(selectedTeam => {
    setTeam(selectedTeam.id);
  }, []);

  const onRoutingTypeChange = useCallback(selectedRoutingType => {
    setRoutingType(selectedRoutingType?.id);
  }, []);

  const onDistributionTypeChange = useCallback(selectedDistType => {
    setDistributionType(selectedDistType?.id);
  }, []);

  const addMeetingType = async () => {
    const response = await post(API.meetings.default(), null, {
      ...values,
      buffer_duration_mins: 60,
      distribution: distributionType.toLowerCase(),
      enabled: active,
      recycle_after_hours: 48,
      routing: routingType.toLowerCase(),
      team,
      touches,
    }).then(res => res);

    if (response && response.ok) {
      onClose();
      reset();
    }
  };

  const toggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiCalendarMonthOutline} size={3} />
        <span>Meeting Definition</span>
        <div className={style.headerActions}>
          <span>activate</span>
          <Switch isOn={active} handleToggle={toggleActive} />
        </div>
      </div>
    );
  };

  const gotoTeamManagement = () => {
    onClose();
    history.push('/organization/teams');
  };

  const handleAddTouches = useCallback(
    ({
      meetingTemplates,
      emailTemplatesCount,
      inviteTemplatesCount,
    }) => {
      setTouches(meetingTemplates);
      setCanAddMeeting(
        emailTemplatesCount === inviteTemplatesCount &&
          emailTemplatesCount > 0,
      );
    },
    [],
  );

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
          <div className="col-1 col-offset-11">
            <Icon
              path={mdiClose}
              size={2}
              className={style.close}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4 col-offset-1">
            <Card header={<ModalHeader />}>
              <form>
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="name">
                      Name
                      <input type="name" name="name" {...bind} />
                    </label>
                    <div className="form--inline">
                      <label htmlFor="description">
                        Description
                        <input
                          type="text"
                          name="description"
                          {...bind}
                        />
                      </label>
                      <label htmlFor="routing">
                        <span>Routing</span>
                        <Dropdown
                          label="Select Routing"
                          labelProp="value"
                          valueProp="id"
                          data={routingTypeData}
                          selectItem={routingType}
                          onSelect={onRoutingTypeChange}
                        />
                      </label>
                    </div>

                    <div className="form--inline">
                      <label htmlFor="team">
                        <span>Team</span>
                        {teams.length ? (
                          <Dropdown
                            label="Select Team"
                            labelProp="name"
                            valueProp="id"
                            data={teams}
                            selectItem={team}
                            onSelect={onTeamChange}
                          />
                        ) : (
                          <Button
                            onClick={gotoTeamManagement}
                            type="tertiary"
                          >
                            Create Team
                          </Button>
                        )}
                      </label>
                      <label htmlFor="routing">
                        <span>Distribution</span>
                        <Dropdown
                          label="Select Distribution"
                          labelProp="value"
                          valueProp="id"
                          data={distributionTypeData}
                          selectItem={distributionType}
                          onSelect={onDistributionTypeChange}
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
                      disabled={!canAddMeeting}
                      icon={mdiPlus}
                      type="primary"
                      onClick={addMeetingType}
                    >
                      <span>Add</span>
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
          <div className="col-6">
            <TemplateDnD onChange={handleAddTouches} />
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

AddMeetingType.propTypes = {
  distributionTypeData: PropTypes.arrayOf(PropTypes.any),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  routingTypeData: PropTypes.arrayOf(PropTypes.any),
  teams: PropTypes.arrayOf(PropTypes.any),
};

AddMeetingType.defaultProps = {
  distributionTypeData: [],
  isOpen: false,
  onClose: () => {},
  routingTypeData: [],
  teams: [],
};

export { AddMeetingType as default };

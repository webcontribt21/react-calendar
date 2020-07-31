/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { mdiCheck, mdiTrashCanOutline } from '@mdi/js';
import style from './style.module.scss';
import { del, patch } from '../../../utils/fetch';
import API from '../../../props';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';
import useInput from '../../../hooks/useInput';
import Dropdown from '../../../components/dropdown/Dropdown';
import Switch from '../../../components/switch/Switch';

const MeetingDetails = ({ meeting, teams }) => {
  const { values, bind, reset } = useInput();
  const [team, setTeam] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates([]);
    reset();
    setEnabled(meeting?.active);
    setTeam(meeting?.team?.name);
  }, [reset, meeting.id, meeting.enabled, meeting]);

  const onTeamChange = useCallback(selectedTeam => {
    setTeam(selectedTeam.id);
  }, []);

  /**
   * @function
   * update
   * @description
   * update function
   *
   * @returns Promise
   */
  const update = () => {
    return patch(API.meetings.default(meeting.id), null, {
      active: enabled,
      team,
      ...values,
    });
  };

  /**
   * @function
   * delete
   * @description
   * update function
   *
   * @returns Promise
   */
  const remove = () => {
    return del(API.meetings.default(meeting.id));
  };

  const toggleEnable = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled]);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <span />
        <div className={style.headerActions}>
          <span>activate</span>
          <Switch isOn={enabled} handleToggle={toggleEnable} />
        </div>
      </div>
    );
  };

  return (
    <div className="row">
      <div className="col-12">
        <Card header={<ModalHeader />}>
          <div className={style.meetingDetails}>
            <div className={style.details}>
              <form className="row">
                <div className="col-12">
                  <div className="form--inline">
                    <label htmlFor="name">
                      <span>Name</span>
                      <input
                        type="text"
                        name="name"
                        value={values.name || meeting.name}
                        {...bind}
                      />
                    </label>
                    <label htmlFor="team">
                      <span>Team</span>
                      <Dropdown
                        labelProp="name"
                        valueProp="id"
                        data={teams}
                        selectItem={team || meeting.team.id}
                        onSelect={onTeamChange}
                      />
                    </label>
                  </div>

                  <div className="form--inline">
                    <label htmlFor="description">
                      <span>Description</span>
                      <input
                        type="text"
                        name="description"
                        value={
                          values.description || meeting.description
                        }
                        {...bind}
                      />
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className={style.meetingActions}>
              <Button
                onClick={remove}
                type="text"
                icon={mdiTrashCanOutline}
              >
                <span>Delete</span>
              </Button>
              <Button onClick={update} icon={mdiCheck}>
                <span>Update</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

MeetingDetails.propTypes = {
  meeting: PropTypes.objectOf(PropTypes.any).isRequired,
  routingTypeData: PropTypes.arrayOf(PropTypes.any).isRequired,
  teams: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export { MeetingDetails as default };

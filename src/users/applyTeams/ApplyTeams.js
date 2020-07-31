/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose, mdiAccountGroupOutline, mdiPlus } from '@mdi/js';
import Select from 'react-dropdown-select';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import { get, patch } from '../../utils/fetch';
import API from '../../props';
import withParameters from '../../utils/url';

ReactModal.setAppElement('#kronologic-ai-app');

const ApplyTeams = ({ isOpen, onClose, onSuccess, users }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  /**
   * @function
   * fetchTeams
   * @description
   * fetches paginated teams from server, using a memoized
   * version of the function.
   * @param {limit} Number limits the number of data being retrieved.
   * @param {offset} Number page index to start retreiving data.
   * @param {sortBy} String sorting column and direction. i.e. id ASC, name DESC.
   *
   */
  const fetchTeams = useCallback(async () => {
    const response = await get(
      withParameters(API.teams.default(), ['limit'], [100]),
    ).then(res => res.json());

    setTeams(response.data);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const applyTeams = useCallback(() => {
    users.map(async user => {
      const response = await patch(API.users.default(user), null, {
        add_to_teams: selectedTeams,
      });
    });

    onSuccess();
  }, [onSuccess, selectedTeams, users]);

  const addTeams = useCallback(addedTeams => {
    setSelectedTeams(addedTeams.map(t => t.id));
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
        className={cx('container is--fluid', style.assignTeams)}
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
            <Card header="Assign Team" icon={mdiAccountGroupOutline}>
              <form>
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="teams" className={style.tagLbl}>
                      <span>Select Team(s)</span>
                      <Select
                        multi
                        searchable
                        name="teams"
                        addPlaceholder="+ team"
                        labelField="name"
                        valueField="id"
                        searchBy="name"
                        clearable={false}
                        options={teams}
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
                      onClick={applyTeams}
                    >
                      <span>Team</span>
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

ApplyTeams.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  users: PropTypes.arrayOf(PropTypes.string).isRequired,
};

ApplyTeams.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};

export { ApplyTeams as default };

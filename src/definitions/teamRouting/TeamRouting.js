/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiFilterPlusOutline,
} from '@mdi/js';
import cx from 'classnames';
import shortid from 'shortid';
import Slider from 'rc-slider';
import Range from 'rc-slider/lib/Range';
import { del, patch, post, get } from '../../utils/fetch';
import API from '../../props';
import withParameters from '../../utils/url';
import style from './style.module.scss';
import { AuthContext } from '../../auth/AuthContextService';
import { MEETING_MGMT } from '../props';
import Dropdown from '../../components/dropdown/Dropdown';
import { compareValues } from '../../utils/array';
import Button from '../../components/button/Button';
import Switch from '../../components/switch/Switch';
import RoutingLogic from './routingLogic/RoutingLogic';

const routingTypeDesc = {
  [MEETING_MGMT.types.routing.CUSTOM]: 'Custom',
  [MEETING_MGMT.types.routing.RANDOM]: 'Random',
  [MEETING_MGMT.types.routing.SEQUENTIAL]: 'Sequential',
};

const distTypeDesc = {
  [MEETING_MGMT.types.distribution.RANDOM]: 'Random',
  [MEETING_MGMT.types.distribution.RANDOM_HIGH_VOLUME]:
    'Random High Volume',
  [MEETING_MGMT.types.distribution.SEQUENTIAL]: 'Sequential',
};

const routingTypeData = Object.keys(MEETING_MGMT.types.routing).map(
  k => ({
    id: k,
    value: routingTypeDesc[MEETING_MGMT.types.routing[k]],
  }),
);

const distTypeData = Object.keys(MEETING_MGMT.types.distribution).map(
  k => {
    return {
      id: k,
      value: distTypeDesc[MEETING_MGMT.types.distribution[k]],
    };
  },
);

function TeamRouting({
  team,
  routing,
  routingLogic,
  rawRoutingLogic,
  distribution,
  onDistributionChange,
  onRoutingChange,
  onRoutingLogicChange,
  onTeamChange,

  buffer,
  onBufferChange,

  properties,
  onPropertiesChange,
}) {
  const bufferDuration = Math.ceil(buffer / 60);
  const routingType = routingTypeData.find(
    dt => dt.id.toLowerCase() === routing,
  );
  const distributionType = distTypeData.find(
    trt => trt.id.toLowerCase() === distribution,
  );

  const [teams, setTeams] = useState([]);
  const [currentUser, serCurrentUser] = useState(null);
  const { logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = userId => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');

    serCurrentUser(userId);
    setIsModalOpen(!isModalOpen);
  };

  const updateTeam = useCallback(
    async (teamSelected, order) => {
      if (teamSelected?.id) {
        const foundTeam = teams.find(t => t.id === teamSelected.id);

        if (foundTeam) {
          const { users: teamUsers } = foundTeam;

          const url = withParameters(
            API.users.default(),
            ['limit', 'offset', 'sortBy'],
            [100, 0, 'firstName asc'],
          );

          const response = await get(url)
            .then(res => res.json())
            .catch(e => {
              if (e.message === '401') {
                logout();
              }
            });

          if (response?.data) {
            const { data } = response;
            const routingLogicData = data
              .filter(u => teamUsers.includes(u.id))
              .map((u, index) => ({
                conditions: [],
                enabled: true,
                order: order
                  ? order.find(o => o.id === u.id).order
                  : index,
                user: {
                  email: u.email,
                  id: u.id,
                  initials:
                    u.firstName.substring(0, 1) +
                    u.lastName.substring(0, 1),
                  name: `${u.firstName} ${u.lastName}`,
                  profileURL: u.profileURL,
                  role: u.role,
                },
              }));

            onTeamChange(routingLogicData, teamSelected);
          }
        }
      }
    },
    [logout, onTeamChange, teams],
  );

  const fetchTeamUsers = useCallback(
    async (teamUsers, order) => {
      const url = withParameters(
        API.users.default(),
        ['limit', 'offset', 'sortBy'],
        [100, 0, 'firstName asc'],
      );

      const response = await get(url)
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (response?.data) {
        const { data } = response;
        const routingLogicData = data
          .filter(u => teamUsers.includes(u.id))
          .map((u, index) => ({
            conditions: [],
            enabled: true,
            order: order
              ? order.find(o => o.id === u.id).order
              : index,
            user: {
              email: u.email,
              id: u.id,
              initials:
                u.firstName.substring(0, 1) +
                u.lastName.substring(0, 1),
              name: `${u.firstName} ${u.lastName}`,
              profileURL: u.profileURL,
              role: u.role,
            },
          }));

        onRoutingLogicChange(routingLogicData);
      }
    },
    [logout, onRoutingLogicChange],
  );

  const fetchByCustomLogic = useCallback(
    async customLogic => {
      const ids = Object.keys(customLogic).map(id =>
        parseInt(id, 10),
      );

      const url = withParameters(
        API.users.default(),
        ['limit', 'offset', 'sortBy'],
        [100, 0, 'firstName asc'],
      );

      const response = await get(url)
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (response?.data) {
        const { data } = response;
        const routingLogicData = data
          .filter(u => ids.includes(u.id))
          .map((u, index) => ({
            conditions: customLogic[u.id].mapping_logic,
            enabled: customLogic[u.id].enabled,
            order: index,
            user: {
              email: u.email,
              id: u.id,
              initials:
                u.firstName.substring(0, 1) +
                u.lastName.substring(0, 1),
              name: `${u.firstName} ${u.lastName}`,
              profileURL: u.profileURL,
              role: u.role,
            },
          }));

        onRoutingLogicChange(routingLogicData);
      }
    },
    [logout, onRoutingLogicChange],
  );

  useEffect(() => {
    if (routingLogic && !rawRoutingLogic.length) {
      const { sequential, custom } = routingLogic;

      if (sequential) {
        fetchTeamUsers(
          sequential.order,
          sequential.order.map((u, index) => ({
            id: u,
            order: index,
          })),
        );
      } else if (custom) {
        fetchByCustomLogic(custom);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawRoutingLogic.length, routingLogic]);

  const getConditions = () => {
    if (rawRoutingLogic && !rawRoutingLogic.length) {
      return [];
    }

    const user = [...rawRoutingLogic].find(
      u => u.user.id === currentUser,
    );

    if (user) {
      return user.conditions;
    }

    return [];
  };

  const fetchTeams = useCallback(async () => {
    const url = withParameters(
      API.teams.default(),
      ['limit', 'offset', 'sortBy'],
      [100, 0, 'name asc'],
    );

    const response = await get(url)
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response && response.data) {
      setTeams(response.data);
    }
  }, [logout]);

  const updateOrder = async (userId, dir) => {
    const swap = (list, iA, iB) => {
      const arr = [...list];
      [arr[iA], arr[iB]] = [arr[iB], arr[iA]];
      return arr;
    };

    const findUserPos = [...rawRoutingLogic].findIndex(
      u => u.user.id === userId,
    );
    const newUsers = swap(
      [...rawRoutingLogic],
      findUserPos,
      findUserPos + dir,
    ).map((u, index) => ({
      ...u,
      order: index,
    }));

    onRoutingLogicChange(newUsers);
  };

  const enable = async (userId, isEnabled) => {
    const newUsers = [...rawRoutingLogic].map(u => {
      return u.user.id === userId
        ? {
            ...u,
            enabled: isEnabled,
          }
        : u;
    });

    onRoutingLogicChange(newUsers);
  };

  const addCustomField = () => {
    const newUsers = [...rawRoutingLogic].map(u => {
      return u.user.id === currentUser
        ? {
            ...u,
            conditions: [
              ...u.conditions,
              {
                field: '',
                id: shortid.generate(),
                operator: '',
                value: '',
              },
            ],
          }
        : u;
    });

    onRoutingLogicChange(newUsers);
  };

  const onSelectCustomField = (conditionId, name, value) => {
    const newUsers = [...rawRoutingLogic].map(u => {
      return u.user.id === currentUser
        ? {
            ...u,
            conditions: [
              ...u.conditions.map(c => {
                return c.id === conditionId
                  ? {
                      ...c,
                      [name]: value,
                    }
                  : c;
              }),
            ],
          }
        : u;
    });

    onRoutingLogicChange(newUsers);
  };

  const updateCustomField = event => {
    const {
      target: { name, value, dataset },
    } = event;

    const newUsers = [...rawRoutingLogic].map(u => {
      return u.user.id === currentUser
        ? {
            ...u,
            conditions: [
              ...u.conditions.map(c => {
                return c.id === dataset.id
                  ? {
                      ...c,
                      [name]: value,
                    }
                  : c;
              }),
            ],
          }
        : u;
    });

    onRoutingLogicChange(newUsers);
  };

  const removeCustomField = conditionId => {
    const newUsers = [...rawRoutingLogic].map(u => {
      return u.user.id === currentUser
        ? {
            ...u,
            conditions: [
              ...u.conditions.filter(c => c.id !== conditionId),
            ],
          }
        : u;
    });

    onRoutingLogicChange(newUsers);
  };

  const setDayRange = values => {
    onPropertiesChange({
      dayRange: {
        from: values[0],
        to: values[1],
      },
    });
  };

  const getDayRange = () => {
    if (properties) {
      const {
        dayRange: { from, to },
      } = properties;

      return <span>{`${from} to ${to} days out`}</span>;
    }

    return null;
  };

  const setGap = gap => {
    onPropertiesChange({
      gap,
    });
  };

  const getGap = () => {
    if (properties) {
      const { gap } = properties;

      return <span>{`Gap: ${gap}`}</span>;
    }

    return null;
  };

  const setDuration = duration => {
    onPropertiesChange({
      duration,
    });
  };

  const getDuration = () => {
    if (properties) {
      const { duration } = properties;

      return <span>{`Duration: ${duration}`}</span>;
    }

    return null;
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <div className={style.teamRouting}>
      <RoutingLogic
        conditions={getConditions()}
        isOpen={isModalOpen}
        onClose={toggleModal}
        onAdd={addCustomField}
        onChange={updateCustomField}
        onRemove={removeCustomField}
        onSelect={onSelectCustomField}
      />
      <div className="row">
        <div className="col-3">
          <div className={style.mainHeader}>
            <form>
              <label htmlFor="team">
                <span>Team</span>
                {teams.length ? (
                  <Dropdown
                    label="Select Team"
                    labelProp="name"
                    valueProp="id"
                    data={teams}
                    selectItem={team}
                    onSelect={updateTeam}
                  />
                ) : (
                  <Link to="/users/teams">Create team?</Link>
                )}
              </label>
              <label htmlFor="routing">
                <span>Team routing</span>
                <Dropdown
                  label="Select Routing"
                  labelProp="value"
                  valueProp="id"
                  data={routingTypeData}
                  selectItem={routingType}
                  onSelect={onRoutingChange}
                />
              </label>
              <label htmlFor="distribution">
                <span>Distribution</span>
                <Dropdown
                  label="Select Distribution"
                  labelProp="value"
                  valueProp="id"
                  data={distTypeData}
                  selectItem={distributionType}
                  onSelect={onDistributionChange}
                />
              </label>

              <div className={style.sliders}>
                {properties && (
                  <>
                    <label>
                      <span>Gap</span>
                      <Slider
                        onChange={setGap}
                        step={15}
                        min={0}
                        max={45}
                        defaultValue={properties.gap}
                      />
                      <span>{getGap()}</span>
                    </label>
                    <label>
                      <span>Duration</span>
                      <Slider
                        onChange={setDuration}
                        step={15}
                        min={15}
                        max={60}
                        defaultValue={properties.duration}
                      />
                      <span>{getDuration()}</span>
                    </label>
                    <label>
                      <span>Day range</span>
                      <Range
                        onAfterChange={setDayRange}
                        allowCross={false}
                        step={1}
                        min={1}
                        max={30}
                        defaultValue={[
                          properties.dayRange.from,
                          properties.dayRange.to,
                        ]}
                      />
                      <span>{getDayRange()}</span>
                    </label>
                  </>
                )}

                <label className={style.lblSlider}>
                  <span>Minimum Scheduling Notice</span>
                  <Slider
                    min={0}
                    max={24}
                    value={bufferDuration}
                    onChange={onBufferChange}
                  />
                  <span>{`${bufferDuration} hrs`}</span>
                </label>
              </div>
            </form>
          </div>
        </div>
        <div className="col-9">
          <ul className={style.users}>
            {rawRoutingLogic.sort(compareValues('order')).map(u => {
              const {
                conditions,
                enabled,
                order,
                user: { id, email, initials, name, profileURL },
              } = u;

              return (
                <li key={`user-${email}`}>
                  <div
                    className={cx(style.user, {
                      [style.disabled]: !enabled,
                    })}
                  >
                    {profileURL !== '' ? (
                      <img
                        data-rh={name}
                        data-rh-at="left"
                        src={profileURL}
                        alt={name}
                      />
                    ) : (
                      <span
                        data-rh={name}
                        data-rh-at="left"
                        className={style.noProfileURL}
                      >
                        {initials}
                      </span>
                    )}
                    <div className={style.email}>
                      <Button type="tertiary">
                        <span>{email}</span>
                      </Button>
                    </div>
                    {routing !== 'custom' && (
                      <div className={style.order}>
                        <Button
                          disabled={order === 0}
                          icon={mdiChevronUp}
                          type="tertiary"
                          onClick={() => updateOrder(id, -1)}
                        />
                        <Button
                          disabled={
                            order >= rawRoutingLogic.length - 1
                          }
                          icon={mdiChevronDown}
                          type="tertiary"
                          onClick={() => updateOrder(id, 1)}
                        />
                      </div>
                    )}
                    <div className={style.actions}>
                      {routing === 'custom' && (
                        <Button
                          className={[
                            conditions.length
                              ? style.hasConditions
                              : '',
                          ]}
                          icon={mdiFilterPlusOutline}
                          type="text"
                          onClick={() => toggleModal(id)}
                        />
                      )}

                      <Switch
                        size="small"
                        isOn={enabled}
                        onClick={() => enable(id, !enabled)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

TeamRouting.propTypes = {
  buffer: PropTypes.number,
  distribution: PropTypes.string,
  onBufferChange: PropTypes.func,
  onDistributionChange: PropTypes.func,
  onPropertiesChange: PropTypes.func,
  onRoutingChange: PropTypes.func,
  onRoutingLogicChange: PropTypes.func,
  onTeamChange: PropTypes.func,
  properties: PropTypes.objectOf(PropTypes.any),
  rawRoutingLogic: PropTypes.arrayOf(PropTypes.any),
  routing: PropTypes.string,
  routingLogic: PropTypes.objectOf(PropTypes.any),
  team: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TeamRouting.defaultProps = {
  buffer: 0,
  distribution: '',
  onBufferChange: () => {},
  onDistributionChange: () => {},
  onPropertiesChange: () => {},
  onRoutingChange: () => {},
  onRoutingLogicChange: () => {},
  onTeamChange: () => {},
  properties: null,
  rawRoutingLogic: [],
  routing: '',
  routingLogic: null,
  team: { id: 0 },
};

export { TeamRouting as default };

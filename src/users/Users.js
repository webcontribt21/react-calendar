import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import cx from 'classnames';
import {
  mdiAccountGroupOutline,
  mdiTrashCanOutline,
  mdiAccountOutline,
  mdiAccountSupervisorOutline,
  mdiAccountStarOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import dayjs from 'dayjs';
import style from './style.module.scss';
import { get, patch, del } from '../utils/fetch';
import API from '../props';
import withParameters from '../utils/url';
import Table, {
  CheckboxCell,
  CheckboxHeader,
  EditingCell,
  EditingJSONCell,
} from '../components/table/Table';
import TagCell from './tableCells/TagCell';
import ApplyTeams from './applyTeams/ApplyTeams';
import Button from '../components/button/Button';
import { AuthContext } from '../auth/AuthContextService';
import { useToasts } from '../hooks/notifications/notifications';
import Dropdown from '../components/dropdown/Dropdown';
import Tag from '../components/tag/Tag';

const roles = {
  DEFAULT: 'default',
  ORG_ADMIN: 'org admin',
  SUPER_ADMIN: 'super admin',
  TEAM_ADMIN: 'team admin',
};

const levels = {
  0: roles.DEFAULT,
  1: roles.TEAM_ADMIN,
  2: roles.ORG_ADMIN,
  3: roles.SUPER_ADMIN,
};

const levelIcons = {
  0: mdiAccountOutline,
  1: mdiAccountSupervisorOutline,
  2: mdiAccountGroupOutline,
  3: mdiAccountStarOutline,
};

const roleOptions = [
  { id: 0, value: roles.DEFAULT },
  { id: 1, value: roles.TEAM_ADMIN },
  { id: 2, value: roles.ORG_ADMIN },
  { id: 3, value: roles.SUPER_ADMIN },
];

const initialSettings = {
  limit: 100,
  offset: 0,
  qry: null,
  sortBy: [
    {
      desc: false,
      id: 'firstName',
    },
  ],
};

const Users = () => {
  const [currentFetchSettings, setCurrentFetchSettings] = useState(
    initialSettings,
  );
  const { user, logout } = useContext(AuthContext);
  const [count, setCount] = useState(0);
  const { add } = useToasts();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isApplyTeamsModalOpen, setApplyTeamsModalOpen] = useState(
    false,
  );

  const modals = {
    ADD_USER: 'addUser',
    APPLY_TEAMS: 'applyTeams',
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

  const getCurrentUser = useCallback(() => {
    if (user()) {
      const {
        user_details: { role, id },
      } = user();

      setCurrentUserId(id);
      setCurrentRole(role);
    }
  }, [user]);

  useEffect(() => {
    fetchTeams();
    getCurrentUser();
  }, [fetchTeams, getCurrentUser]);

  /**
   * @function
   * toggleModal
   * @description
   * Toggles all available modals for Users view.
   *
   * @param {modal} string modal to open/close.
   */
  const toggleModal = useCallback(
    modal => {
      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');

      return {
        [modals.ADD_USER]: () =>
          setAddUserModalOpen(!isAddUserModalOpen),
        [modals.APPLY_TEAMS]: () =>
          setApplyTeamsModalOpen(!isApplyTeamsModalOpen),
      }[modal]();
    },
    [
      modals.ADD_USER,
      modals.APPLY_TEAMS,
      isAddUserModalOpen,
      isApplyTeamsModalOpen,
    ],
  );

  /**
   * @function
   * fetchUsers
   * @description
   * fetches paginated users from server, using a memoized
   * version of the function.
   * @param {limit} Number limits the number of data being retrieved.
   * @param {offset} Number page index to start retreiving data.
   * @param {sortBy} String sorting column and direction. i.e. id ASC, name DESC.
   *
   */
  const fetchUsers = useCallback(
    async (limit, offset, sortBy, qry) => {
      let qryFields = ['limit', 'offset'];
      let qryFieldsValues = [limit, offset];

      if (sortBy?.length) {
        qryFields = [...qryFields, 'sortBy'];

        qryFieldsValues = [
          ...qryFieldsValues,
          sortBy
            .map(
              sortItem =>
                `${sortItem.id} ${sortItem.desc ? 'desc' : 'asc'}`,
            )
            .join(),
        ];
      }

      if (qry) {
        qryFields = [...qryFields, 'qry'];

        qryFieldsValues = [...qryFieldsValues, qry];
      }

      const response = await get(
        withParameters(
          API.users.default(),
          qryFields,
          qryFieldsValues,
        ),
      ).then(res => res.json());

      if (response?.data) {
        const { data } = response;

        setUsers(
          data.map(u => ({
            ...u,
            teams: teams.filter(t => u.teams.includes(t.id)),
          })),
        );

        setCount(response.total);
        setPageCount(Math.ceil(response.total / limit));
        setCurrentFetchSettings({
          limit,
          offset,
          qry,
          sortBy,
        });
      }
    },
    [teams],
  );

  /**
   * @function
   * updateUser
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   * @param {prop} String column prop for JSON objects.
   */
  const updateUser = ({ id, column, value }) => {
    return patch(API.users.default(id), null, {
      [column]: value,
    });
  };

  const editRole = useCallback((id, roleLevel) => {
    return patch(API.users.default(id), null, { role: roleLevel });
  }, []);

  /**
   * @function
   * deleteUsers
   * @description
   * deletes selected users
   */
  const deleteUsers = useCallback(() => {
    return del(API.users.default(), {
      data: [selectedUsers.join()],
      params: ['ids'],
    });
  }, [selectedUsers]);

  const getRole = useCallback(
    (id, level) => {
      const filteredRoles = roleOptions.map(roleOption => {
        return roleOption.id <= currentRole
          ? roleOption
          : {
              ...roleOption,
              disabled: true,
            };
      });

      return (
        <Dropdown
          labelProp="value"
          valueProp="id"
          data={filteredRoles}
          selectItem={filteredRoles.find(r => r.id === level)}
          onSelect={item => editRole(id, item.id)}
        />
      );
    },
    [currentRole, editRole],
  );

  const handleSuccess = useCallback(
    async (toggle = true) => {
      if (toggle) {
        toggleModal(modals.APPLY_TEAMS);
      }
      add('User team applied', mdiAccountOutline);

      fetchUsers(10, 0);
    },
    [add, fetchUsers, modals.APPLY_TEAMS, toggleModal],
  );

  const handleTeamRemove = useCallback(async () => {
    await fetchUsers(10, 0);
    add('User updated', mdiAccountOutline);
  }, [add, fetchUsers]);

  /**
   * @function
   * columns
   * @description
   * memoized function returning column description to be used by
   * table component.
   */
  const columns = useMemo(
    () => [
      {
        Cell: CheckboxCell,
        Header: CheckboxHeader,
        id: 'selection',
      },
      {
        Cell: row => {
          const {
            row: {
              original: { firstName, lastName, profileURL },
            },
          } = row;

          const initials = `${firstName.substring(
            0,
            1,
          )}${lastName.substring(0, 1)}`;

          return (
            <div className={style.centered}>
              <div className={style.profileURL}>
                {profileURL && (
                  <img
                    src={profileURL}
                    alt={`${firstName} ${lastName}`}
                  />
                )}
                {!profileURL && (
                  <span className={style.noProfileURL}>
                    {initials}
                  </span>
                )}
              </div>
            </div>
          );
        },
        Header: '',
        accessor: 'profileURL',
        disableSorting: true,
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'first',
        accessor: 'firstName',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'last',
        accessor: 'lastName',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'email',
        accessor: 'email',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'title',
        accessor: 'title',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'Location',
        accessor: 'location',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateUser} />
        ),
        Header: 'Meeting Link',
        accessor: 'meetingLink',
      },
      {
        Cell: row => {
          const {
            cell: { value },
            row: {
              original: { id: userId },
            },
          } = row;

          const handleDelete = async tagSelected => {
            await updateUser({
              column: 'remove_from_teams',
              id: userId,
              value: value
                .filter(t => t.id === tagSelected.id)
                .map(t => t.id),
            });
            handleTeamRemove();
          };

          return (
            <TagCell row={row} canDelete onDelete={handleDelete} />
          );
        },
        Header: 'Teams',
        accessor: 'teams',
        disableSorting: true,
        id: 'teams',
      },
      {
        Cell: row => {
          const {
            cell: { value },
          } = row;

          if (value) {
            const {
              tokenExpiresAt: { Time, Valid },
            } = value;

            if (Valid) {
              const isExpired = dayjs(Time).isBefore(dayjs());
              const validUntil = dayjs(Time).fromNow();

              return (
                <div className={style.centered}>
                  <Tag type={isExpired ? 'error' : 'default'}>
                    {isExpired ? 'expired' : validUntil}
                  </Tag>
                </div>
              );
            }
          }

          return null;
        },
        Header: 'token status',
        accessor: 'token',
      },
      {
        Cell: row => {
          const {
            cell: { value: id },
            row: {
              original: { role: value },
            },
          } = row;

          if (currentUserId === id) {
            return (
              <div className={style.roleIcon}>
                <Icon
                  path={levelIcons[currentRole]}
                  size={1}
                  data-rh={levels[currentRole]}
                  data-rh-at="bottom"
                />
              </div>
            );
          }

          return (
            <div className={style.roleIcon}>{getRole(id, value)}</div>
          );
        },
        Header: 'Role',
        accessor: 'id',
        disableSorting: true,
        id: 'edit',
      },
    ],
    [currentRole, currentUserId, getRole, handleTeamRemove],
  );

  const controls = useMemo(
    () => [
      <Button
        key="bttn-delete-users"
        type="secondary"
        icon={mdiTrashCanOutline}
        disabled={!selectedUsers.length}
        data-rh="Delete Users"
        data-rh-at="bottom"
        onClick={deleteUsers}
      />,
      <Button
        key="bttn-assign-teams"
        type="primary"
        icon={mdiAccountGroupOutline}
        disabled={!selectedUsers.length}
        data-rh="Assign Teams"
        data-rh-at="bottom"
        onClick={() => toggleModal(modals.APPLY_TEAMS)}
      />,
    ],
    [
      deleteUsers,
      modals.APPLY_TEAMS,
      selectedUsers.length,
      toggleModal,
    ],
  );

  return (
    <>
      {selectedUsers.length > 0 && (
        <ApplyTeams
          isOpen={isApplyTeamsModalOpen}
          onSuccess={handleSuccess}
          onClose={() => toggleModal(modals.APPLY_TEAMS)}
          users={selectedUsers}
        />
      )}
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row')}>
          <div className="col-12">
            <Table
              controls={controls}
              columns={columns}
              data={users}
              fetchData={fetchUsers}
              initialPageSize={currentFetchSettings.limit}
              initialSort={currentFetchSettings.sortBy}
              pageCount={pageCount}
              total={count}
              onSelect={setSelectedUsers}
              properties={{
                fluid: true,
                showCount: false,
                showPageSize: true,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export { Users as default };

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
  mdiSwapHorizontal,
} from '@mdi/js';
import Icon from '@mdi/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import style from './style.module.scss';
import { get, patch, del } from '../utils/fetch';
import API from '../props';
import withParameters from '../utils/url';
import Table, {
  CheckboxCell,
  CheckboxHeader,
  EditingCell,
} from '../components/table/Table';
import Button from '../components/button/Button';
import { AuthContext } from '../auth/AuthContextService';
import { useToasts } from '../hooks/notifications/notifications';
import Dropdown from '../components/dropdown/Dropdown';
import { jwtEncode } from '../utils/format';
import { AdminContext } from '../providers/AdminContext';
import Tag from '../components/tag/Tag';

dayjs.extend(relativeTime);

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
      id: 'id',
    },
  ],
};

const Admin = () => {
  const [currentFetchSettings, setCurrentFetchSettings] = useState(
    initialSettings,
  );
  const { user, logout } = useContext(AuthContext);
  const { setInfo } = useContext(AdminContext);
  const [count, setCount] = useState(0);
  const { add } = useToasts();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  const actAs = useCallback(
    userObj => {
      const jwt = jwtEncode({ id: userObj.id, org: userObj.org });
      setInfo({
        actingAs: {
          first: userObj.firstName,
          jwt,
          last: userObj.lastName,
        },
      });
    },
    [setInfo],
  );

  const modals = {
    ADD_USER: 'addUser',
  };

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
    getCurrentUser();
  }, [getCurrentUser]);

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
      }[modal]();
    },
    [modals.ADD_USER, isAddUserModalOpen],
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
  const fetchUsers = useCallback((limit, offset, sortBy, qry) => {
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

    return get(
      withParameters(API.users.all, qryFields, qryFieldsValues),
    )
      .then(res => res.json())
      .then(response => {
        if (response) {
          const { data, total } = response;

          setUsers(data);
          setCount(total);
          setPageCount(Math.ceil(total / limit));
          setCurrentFetchSettings({
            limit,
            offset,
            qry,
            sortBy,
          });
        }
      });
  }, []);

  const updateUser = ({ id, column, value }) => {
    return patch(API.users.default(id), null, {
      [column]: value,
    });
  };

  const editRole = useCallback((id, roleLevel) => {
    return patch(API.users.default(id), null, { role: roleLevel });
  }, []);

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

  const getAvailability = (from = 0, to = 1500) => {
    const formattedFrom = dayjs()
      .startOf('day')
      .minute(from)
      .format('h:mm a');
    const formattedTo = dayjs()
      .startOf('day')
      .minute(to)
      .format('h:mm a');

    return <span>{`${formattedFrom}-${formattedTo}`}</span>;
  };

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
              original: { id },
            },
          } = row;

          return <div className={style.centered}>{id}</div>;
        },
        Header: 'id',
        accessor: 'id',
      },
      {
        Header: 'organization',
        accessor: 'org',
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
            <div className={style.profileURL}>
              {profileURL && (
                <img
                  src={profileURL}
                  alt={`${firstName} ${lastName}`}
                />
              )}
              {!profileURL && (
                <span className={style.noProfileURL}>{initials}</span>
              )}
            </div>
          );
        },
        Header: 'Profile URL',
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
        Cell: row => {
          const {
            cell: { value },
          } = row;

          return (
            <div className={style.centered}>
              <div className={style.scheduling}>
                <div className={style.weekdays}>
                  {value.weekdays
                    .sort()
                    .map(wd => {
                      return dayjs()
                        .day(wd)
                        .format('dd');
                    })
                    .join(', ')}
                </div>
                <div className={style.availability}>
                  {getAvailability(value.from, value.to)}
                </div>
              </div>
            </div>
          );
        },
        Header: 'schedulers',
        accessor: 'schedulers',
        disableSorting: true,
      },
      {
        Header: 'timezone',
        accessor: 'timezone',
        disableSorting: true,
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
      {
        Cell: row => {
          const {
            row: {
              original: { firstName, lastName, id, org },
            },
          } = row;

          return (
            <div className={style.centered}>
              <Button
                type="secondary"
                icon={mdiSwapHorizontal}
                onClick={() =>
                  actAs({ firstName, id, lastName, org })
                }
              />
            </div>
          );
        },
        Header: 'Act as',
        accessor: 'id',
        disableSorting: true,
        id: 'acting',
      },
    ],
    [actAs, currentRole, currentUserId, getRole],
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
    ],
    [deleteUsers, selectedUsers.length],
  );

  return (
    <>
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row')}>
          <div className="col-12">
            <Table
              rowID="email"
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

export { Admin as default };

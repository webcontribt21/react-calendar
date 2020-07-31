import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import cx from 'classnames';
import {
  mdiTrashCanOutline,
  mdiAccountMultiplePlusOutline,
  mdiGaugeEmpty,
  mdiPlus,
} from '@mdi/js';
import style from './style.module.scss';
import { get, patch, del } from '../utils/fetch';
import API from '../props';
import withParameters from '../utils/url';
import Table, {
  CheckboxCell,
  CheckboxHeader,
  EditingCell,
} from '../components/table/Table';
import AddTeam from './addTeam/AddTeam';
import Button, { ButtonGroup } from '../components/button/Button';
import { AuthContext } from '../auth/AuthContextService';
import { EmptyView } from '../components/genericView/GenericView';
import { useToasts } from '../hooks/notifications/notifications';

const modals = {
  ADD_TEAM: 'addTeam',
};

const Teams = () => {
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();
  const [count, setCount] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isAddTeamModalOpen, setAddTeamModalOpen] = useState(false);

  /**
   * @function
   * toggleModal
   * @description
   * Toggles all available modals for Teams view.
   *
   * @param {modal} string modal to open/close.
   */
  const toggleModal = useCallback(
    modal => {
      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');

      return {
        [modals.ADD_TEAM]: () =>
          setAddTeamModalOpen(!isAddTeamModalOpen),
      }[modal]();
    },
    [isAddTeamModalOpen],
  );

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
  const fetchTeams = useCallback(
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
          API.teams.default(),
          qryFields,
          qryFieldsValues,
        ),
      ).then(res => res.json());

      setTeams(response.data);
      setCount(response.total);
      setPageCount(Math.ceil(response.total / limit));
    },
    [],
  );

  /**
   * @function
   * updateTeam
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   */
  const updateTeam = useCallback(
    async ({ id, column, value }) => {
      const response = await patch(API.teams.default(id), null, {
        [column]: value,
      })
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (response.success) {
        await fetchTeams(10, 0);
        add('Team updated', mdiAccountMultiplePlusOutline);
      }
    },
    [add, fetchTeams, logout],
  );

  /**
   * @function
   * deleteTeams
   * @description
   * deletes selected teams
   */
  const deleteTeams = useCallback(async () => {
    const response = await del(API.teams.default(), {
      data: [selectedTeams.join()],
      params: ['ids'],
    })
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response.success) {
      await fetchTeams(10, 0);
      add('Team deleted', mdiAccountMultiplePlusOutline);
    }
  }, [add, fetchTeams, logout, selectedTeams]);

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
        Cell: row => (
          <EditingCell row={row} updateFunc={updateTeam} />
        ),
        Header: 'name',
        accessor: 'name',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateTeam} />
        ),
        Header: 'location',
        accessor: 'location',
      },
      {
        Cell: row => {
          const {
            cell: { value: users },
          } = row;

          return (
            <div className={style.userCount}>{users.length}</div>
          );
        },
        Header: 'User count',
        accessor: 'users',
      },
    ],
    [updateTeam],
  );

  const controls = useMemo(
    () => [
      <Button
        key="bttn-delete-teams"
        type="secondary"
        icon={mdiTrashCanOutline}
        disabled={!selectedTeams.length}
        data-rh="Delete Teams"
        data-rh-at="top"
        onClick={deleteTeams}
      />,
      <Button
        key="bttn-add-team"
        type="primary"
        icon={mdiPlus}
        onClick={() => toggleModal(modals.ADD_TEAM)}
      >
        <span>Team</span>
      </Button>,
    ],
    [deleteTeams, selectedTeams.length, toggleModal],
  );

  const getEmptyView = useCallback(() => {
    return (
      <EmptyView
        icon={mdiGaugeEmpty}
        view="teams"
        actions={[
          <Button
            key="actions-add-team"
            icon={mdiPlus}
            onClick={() => toggleModal(modals.ADD_TEAM)}
          >
            <span>Add Team</span>
          </Button>,
        ]}
      />
    );
  }, [toggleModal]);

  const handleSuccess = useCallback(async () => {
    await fetchTeams(10, 0);
    toggleModal(modals.ADD_TEAM);
    add('Team added', mdiAccountMultiplePlusOutline);
  }, [add, fetchTeams, toggleModal]);

  return (
    <>
      <AddTeam
        isOpen={isAddTeamModalOpen}
        onClose={() => toggleModal(modals.ADD_TEAM)}
        onSuccess={handleSuccess}
      />
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row')}>
          <div className="col-12">
            <Table
              controls={controls}
              columns={columns}
              noData={getEmptyView()}
              data={teams}
              fetchData={fetchTeams}
              initialSort={[
                {
                  desc: false,
                  id: 'name',
                },
              ]}
              pageCount={pageCount}
              total={count}
              onSelect={setSelectedTeams}
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

export { Teams as default };

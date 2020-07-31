import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  mdiTrashCanOutline,
  mdiGaugeEmpty,
  mdiToggleSwitch,
  mdiTimelineTextOutline,
  mdiToggleSwitchOff,
} from '@mdi/js';
import dayjs from 'dayjs';
import useInterval from '../hooks/useInterval';
import { AuthContext } from '../auth/AuthContextService';
import style from './contacts.module.scss';
import { get, patch, del } from '../utils/fetch';
import API from '../props';
import withParameters from '../utils/url';
import Table, {
  CheckboxCell,
  CheckboxHeader,
} from '../components/table/Table';
import SwitchCell from './tableCells/SwitchCell';
import TagCell from './tableCells/TagCell';
import TouchDropsCell from './tableCells/TouchDropsCell';
import Button, { ButtonGroup } from '../components/button/Button';
import TotalCount from './cards/TotalCount';
import TotalCost from './cards/TotalCost';
import LatestResults from './cards/LatestResults';
import { EmptyView } from '../components/genericView/GenericView';
import Invite from './invite/Invite';
import { formatCurrency } from '../utils/format';

const meetingStatus = {
  accepted: 'accepted',
  cancelled: 'cancelled',
  declined: 'declined',
  initialized: 'initialized',
  negotiation_in_progress: 'negotiating',
  requires_user_intervention: 'requires user intervention',
  waiting_for_first_response: 'pending',
};

const initialSettings = {
  limit: 100,
  offset: 0,
  qry: null,
  sortBy: [
    {
      desc: false,
      id: 'user',
    },
  ],
};

const MeetingInstances = () => {
  const [currentFetchSettings, setCurrentFetchSettings] = useState(
    initialSettings,
  );
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [count, setCount] = useState(0);
  const [results, setResults] = useState({
    accepted: 0,
    cancelled: 0,
    declined: 0,
    pending: 0,
    rui: 0,
  });
  const [totalCost, setTotalCost] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [inviteOpen, isInviteOpen] = useState({
    id: null,
    isOpen: false,
  });
  const { logout } = useContext(AuthContext);

  const fetchMeetings = useCallback(
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

      return get(
        withParameters(
          API.meetings.instances,
          qryFields,
          qryFieldsValues,
        ),
      )
        .then(res => res.json())
        .then(response => {
          if (response) {
            const {
              data,
              total,
              totalCost: cost,
              ...rest
            } = response;

            if (data) {
              setMeetings(data);
              setCount(total);
              setTotalCost(cost);
              setResults({
                accepted: rest.totalAccepted,
                cancelled: rest.totalCancelled,
                declined: rest.totalDeclined,
                pending: rest.totalPending,
                rui: rest.totalRUI,
              });
              setPageCount(Math.ceil(total / limit));
              setCurrentFetchSettings({
                limit,
                offset,
                qry,
                sortBy,
              });
            }
          }
        })
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });
    },
    [logout],
  );

  useInterval(
    () =>
      fetchMeetings(
        currentFetchSettings.limit,
        currentFetchSettings.offset,
        currentFetchSettings.sortBy,
        currentFetchSettings.qry,
      ),
    3000,
  );

  const removeMeetingInstance = useCallback(
    async mId => {
      const response = await del(API.meetings.instance, {
        data: [mId],
        params: ['ids'],
      });

      if (response) {
        await fetchMeetings(
          currentFetchSettings.limit,
          currentFetchSettings.offset,
          currentFetchSettings.sortBy,
          currentFetchSettings.qry,
        );
      }
    },
    [currentFetchSettings, fetchMeetings],
  );

  const removeSelectedMeetingInstance = useCallback(async () => {
    const response = await del(API.meetings.instance, {
      data: [selectedMeetings.join()],
      params: ['ids'],
    });

    if (response) {
      await fetchMeetings(
        currentFetchSettings.limit,
        currentFetchSettings.offset,
        currentFetchSettings.sortBy,
        currentFetchSettings.qry,
      );
    }
  }, [currentFetchSettings, fetchMeetings, selectedMeetings]);

  const activate = useCallback(
    async value => {
      await patch(API.meetings.instance, null, [value]).catch(e => {
        if (e.message === '401') {
          logout();
        }
      });
    },
    [logout],
  );

  const activateAll = useCallback(
    async (isActive = true) => {
      await patch(
        API.meetings.instance,
        null,
        selectedMeetings.map(id => {
          return { active: isActive, id: parseInt(id, 10) };
        }),
      ).catch(e => {
        if (e.message === '401') {
          logout();
        }
      });
    },
    [logout, selectedMeetings],
  );

  const showInvite = data => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');
    isInviteOpen({
      data,
      isOpen: true,
    });
  };

  const closeInvite = () => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');
    isInviteOpen({
      id: null,
      isOpen: false,
    });
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
            cell: { value },
          } = row;

          return <div className={style.centered}>{value}</div>;
        },
        Header: 'ID',
        accessor: 'meetingId',
      },
      {
        Header: 'user email',
        accessor: 'user',
      },
      {
        Header: 'contact email',
        accessor: 'contact',
      },
      {
        Cell: row => {
          return (
            <TagCell
              row={row}
              onDelete={tagValue =>
                removeMeetingInstance(tagValue.id)
              }
            />
          );
        },
        Header: 'Type',
        accessor: 'type',
      },
      {
        Cell: row => <TagCell row={row} mappings={meetingStatus} />,
        Header: 'status',
        accessor: 'status',
        id: 'status',
      },
      {
        Cell: row => <TouchDropsCell row={row} />,
        Header: 'attempts',
        accessor: 'attempts',
        disableSorting: true,
      },
      {
        Cell: row => (
          <SwitchCell size="small" row={row} updateFunc={activate} />
        ),
        Header: 'Active',
        accessor: 'active',
      },
      {
        Cell: row => {
          const {
            cell: { value },
          } = row;

          return (
            <div className={style.centered}>
              {value.Valid &&
                dayjs(value.Time).format('ddd M/DD h:mm a')}
            </div>
          );
        },
        Header: 'Meeting Time',
        accessor: 'meetingTime',
      },
      {
        Cell: row => {
          const {
            cell: { value },
          } = row;

          return (
            <div className={style.centered}>{`${value} mins`}</div>
          );
        },
        Header: 'duration',
        accessor: 'duration',
        disableSorting: true,
      },
      {
        Cell: row => {
          const {
            cell: { value },
          } = row;

          return (
            <div className={style.centered}>
              {formatCurrency(value)}
            </div>
          );
        },
        Header: 'value',
        accessor: 'cost',
      },
      {
        Cell: row => {
          const {
            cell: { value },
            row: {
              original: { contact, user, meetingId },
            },
          } = row;

          return (
            <div className={style.centered}>
              <Button
                type="tertiary"
                onClick={() =>
                  showInvite({ contact, user, value: meetingId })
                }
              >
                <span>
                  {value.Valid &&
                    dayjs(value.Time).format('ddd M/DD h:mm a')}
                </span>
              </Button>
            </div>
          );
        },
        Header: 'last activity',
        accessor: 'lastActivity',
      },
    ],
    [activate, removeMeetingInstance],
  );

  const controls = useMemo(
    () => [
      <Button
        key="table-bulk-delete"
        type="secondary"
        icon={mdiTrashCanOutline}
        disabled={!selectedMeetings.length}
        data-rh="Bulk Delete"
        data-rh-at="right"
        onClick={removeSelectedMeetingInstance}
      />,
      <ButtonGroup key="table-bulk-actions">
        <Button
          type="secondary"
          icon={mdiToggleSwitchOff}
          disabled={!selectedMeetings.length}
          data-rh="Bulk Deactivation"
          data-rh-at="right"
          onClick={() => activateAll(false)}
        />
        <Button
          type="secondary"
          icon={mdiToggleSwitch}
          disabled={!selectedMeetings.length}
          data-rh="Bulk Activation"
          data-rh-at="right"
          onClick={() => activateAll(true)}
        />
      </ButtonGroup>,
      <span key="table-contacts-count" className={style.count}>
        {`selected: ${selectedMeetings.length}`}
      </span>,
    ],
    [
      activateAll,
      removeSelectedMeetingInstance,
      selectedMeetings.length,
    ],
  );

  const getEmptyView = useCallback(() => {
    return (
      <EmptyView icon={mdiGaugeEmpty} view="meeting instances" />
    );
  }, []);

  return (
    <div className={style.contacts}>
      <Invite
        isOpen={inviteOpen.isOpen}
        onClose={closeInvite}
        data={inviteOpen.data}
      />
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row', style.content, style.cards)}>
          <div className="col-2">
            <TotalCount count={count} />
          </div>

          <div className="col-2">
            <TotalCost count={totalCost} />
          </div>
          <div className="col-8">
            <LatestResults {...results} />
          </div>
        </div>
        <div className={cx('row', style.content)}>
          <div className="col-12">
            <Table
              controls={controls}
              noData={getEmptyView()}
              columns={columns}
              data={meetings}
              fetchData={fetchMeetings}
              initialPageSize={currentFetchSettings.limit}
              initialSort={currentFetchSettings.sortBy}
              pageCount={pageCount}
              total={count}
              onSelect={setSelectedMeetings}
              properties={{
                fluid: true,
                showCount: false,
                showPageSize: true,
              }}
              rowID="meetingId"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

MeetingInstances.propTypes = {
  location: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.object,
    url: PropTypes.string,
  }).isRequired,
};

export { MeetingInstances as default };

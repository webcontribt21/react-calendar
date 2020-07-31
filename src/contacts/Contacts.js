import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  mdiUploadOutline,
  mdiTrashCanOutline,
  mdiPlus,
  mdiAccountAlertOutline,
  mdiGaugeEmpty,
  mdiCalendarPlus,
  mdiPencil,
} from '@mdi/js';
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
import AddContact from './addContact/AddContact';
import ApplyTags from './applyTags/ApplyTags';
import UploadCSV from './uploadCSV/UploadCSV';
import ActiveContacts from './cards/ActiveContacts';
import TotalCount from './cards/TotalCount';
import { useToasts } from '../hooks/notifications/notifications';
import { EmptyView } from '../components/genericView/GenericView';

const modals = {
  ADD_CONTACT: 'addContact',
  ADD_TAG: 'addTag',
  UPLOAD_CSV: 'uploadCSV',
};

const meetingStatus = {
  accepted: 'accepted',
  cancelled: 'cancelled',
  declined: 'declined',
  initialized: 'initialized',
  negotiation_in_progress: 'in progress',
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
      id: 'firstName',
    },
  ],
};

const Contacts = () => {
  const [currentFetchSettings, setCurrentFetchSettings] = useState(
    initialSettings,
  );
  const [count, setCount] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState({
    contact: null,
    isOpen: false,
  });
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();

  /**
   * @function
   * toggleModal
   * @description
   * Toggles all available modals for Contacts view.
   *
   * @param {modal} string modal to open/close.
   */
  const toggleModal = useCallback(
    (modal, contact) => {
      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');

      return {
        [modals.ADD_CONTACT]: () =>
          setIsModalOpen({ isOpen: !isModalOpen.isOpen }),
        [modals.EDIT_CONTACT]: () =>
          setIsModalOpen({ contact, isOpen: !isModalOpen.isOpen }),
        [modals.ADD_TAG]: () => setIsTagsModalOpen(!isTagsModalOpen),
        [modals.UPLOAD_CSV]: () => setIsCSVModalOpen(!isCSVModalOpen),
      }[modal]();
    },
    [isModalOpen, isTagsModalOpen, isCSVModalOpen],
  );

  /**
   * @function
   * fetchContacts
   * @description
   * fetches paginated contacts from server, using a memoized
   * version of the function.
   * @param {limit} Number limits the number of data being retrieved.
   * @param {offset} Number page index to start retreiving data.
   * @param {sortBy} String sorting column and direction. i.e. id ASC, name DESC.
   *
   */
  const fetchContacts = useCallback(
    (limit, offset, sortBy, qry) => {
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
          API.contacts.default(),
          qryFields,
          qryFieldsValues,
        ),
      )
        .then(res => res.json())
        .then(response => {
          if (response && response.data) {
            setContacts(response.data);
            setCount(response.total);
            setPageCount(Math.ceil(response.total / limit));
            setCurrentFetchSettings({
              limit,
              offset,
              qry,
              sortBy,
            });
          }
        })
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logout],
  );

  useInterval(
    () =>
      fetchContacts(
        currentFetchSettings.limit,
        currentFetchSettings.offset,
        currentFetchSettings.sortBy,
        currentFetchSettings.qry,
      ),
    3000,
  );

  /**
   * @function
   * updateContact
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   */
  const updateContact = useCallback(
    async ({ id, column, value }) => {
      const response = await patch(API.contacts.default(id), null, {
        [column]: value,
      }).catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

      if (response.ok) {
        add('Contact updated', mdiAccountAlertOutline);
      }
    },
    [add, logout],
  );

  /**
   * @function
   * updateContact
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   */
  const updateContactMeeting = useCallback(
    async ({ id, value }) => {
      const { id: mid, active } = value;

      await patch(API.meetings.instance, null, [
        {
          active,
          id: mid,
        },
      ])
        .then(response => {
          if (response) {
            fetchContacts(
              currentFetchSettings.limit,
              currentFetchSettings.offset,
              currentFetchSettings.sortBy,
              currentFetchSettings.qry,
            );
            add(
              `Meeting for contact was ${
                active ? 'enabled' : 'disabled'
              }`,
              mdiAccountAlertOutline,
            );
          }
        })
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [add, currentFetchSettings, logout],
  );

  /**
   * @function
   * deleteContacts
   * @description
   * deletes selected contacts
   */
  const deleteContacts = useCallback(async () => {
    const response = await del(API.contacts.default(), {
      data: [selectedContacts.join()],
      params: ['ids'],
    }).catch(e => {
      if (e.message === '401') {
        logout();
      }
    });

    if (response.ok) {
      await fetchContacts(
        currentFetchSettings.limit,
        currentFetchSettings.offset,
        currentFetchSettings.sortBy,
        currentFetchSettings.qry,
      );

      add(
        `${selectedContacts.length} contact deleted`,
        mdiAccountAlertOutline,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [add, fetchContacts, logout, selectedContacts]);

  const handleAddedContact = useCallback(
    async (contact, msg) => {
      await fetchContacts(
        currentFetchSettings.limit,
        currentFetchSettings.offset,
        currentFetchSettings.sortBy,
        currentFetchSettings.qry,
      );
      toggleModal(modals.ADD_CONTACT);
      add(msg || 'contact added', mdiAccountAlertOutline);
    },
    [
      add,
      currentFetchSettings.limit,
      currentFetchSettings.offset,
      currentFetchSettings.qry,
      currentFetchSettings.sortBy,
      fetchContacts,
      toggleModal,
    ],
  );

  const handleUpload = useCallback(
    async (totalCountUploaded, uploadStatus) => {
      toggleModal(modals.UPLOAD_CSV);

      if (uploadStatus !== 200) {
        add(
          `Error ${uploadStatus}: problem uploading contacts`,
          mdiAccountAlertOutline,
        );
      } else {
        await fetchContacts(
          currentFetchSettings.limit,
          0,
          currentFetchSettings.sortBy,
          currentFetchSettings.qry,
        );

        add(
          `${totalCountUploaded} contacts added`,
          mdiAccountAlertOutline,
        );
      }
    },
    [
      add,
      currentFetchSettings.limit,
      currentFetchSettings.qry,
      currentFetchSettings.sortBy,
      fetchContacts,
      toggleModal,
    ],
  );

  const removeMeetingInstance = useCallback(
    async mId => {
      const response = await del(API.meetings.instance, {
        data: [mId],
        params: ['ids'],
      });

      if (response) {
        await fetchContacts(
          currentFetchSettings.limit,
          0,
          currentFetchSettings.sortBy,
          currentFetchSettings.qry,
        );

        add(
          `${selectedContacts.length} contact deleted`,
          mdiAccountAlertOutline,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [add, fetchContacts, selectedContacts.length],
  );

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
        Header: 'contacts',
        columns: [
          {
            Cell: CheckboxCell,
            Header: CheckboxHeader,
            id: 'selection',
          },
          {
            Cell: row => {
              const {
                row: { original },
              } = row;

              const { firstName, lastName, profilePic } = original;
              const initials = `${firstName.substring(
                0,
                1,
              )}${lastName.substring(0, 1)}`;

              return (
                <div className={style.centered}>
                  <Button
                    type="text"
                    className={style.profileURL}
                    onClick={() =>
                      toggleModal(modals.EDIT_CONTACT, original)
                    }
                  >
                    {profilePic && (
                      <img
                        src={profilePic}
                        alt={`${firstName} ${lastName}`}
                      />
                    )}
                    {!profilePic && (
                      <span className={style.noProfileURL}>
                        {initials}
                      </span>
                    )}
                  </Button>
                </div>
              );
            },
            Header: '',
            accessor: 'profileURL',
            disableSorting: true,
          },
          {
            Header: 'first',
            accessor: 'firstName',
          },
          {
            Header: 'last',
            accessor: 'lastName',
          },
          {
            Header: 'email',
            accessor: 'email',
          },
          {
            Header: 'account',
            accessor: 'account',
          },
          {
            Header: 'logic field',
            accessor: 'logicField',
          },
        ],
      },
      {
        Header: 'meetings',
        columns: [
          {
            Cell: row => {
              return (
                <TagCell
                  row={row}
                  canDelete
                  onDelete={tagValue =>
                    removeMeetingInstance(tagValue.id)
                  }
                />
              );
            },
            Header: 'Type',
            accessor: 'meetings',
            disableSorting: true,
            id: 'type',
            style: 'meetings',
          },
          {
            Cell: row => (
              <SwitchCell
                size="small"
                row={row}
                updateFunc={updateContactMeeting}
              />
            ),
            Header: 'Active',
            accessor: 'meetings',
            disableSorting: true,
            id: 'active',
          },
          {
            Cell: row => <TouchDropsCell row={row} />,
            Header: 'Attempts',
            accessor: 'meetings',
            disableSorting: true,
            id: 'meetingAttempts',
          },
          {
            Cell: row => (
              <TagCell row={row} mappings={meetingStatus} />
            ),
            Header: 'Status',
            accessor: 'meetings',
            disableSorting: true,
            id: 'status',
          },
        ],
      },
      /*
      {
        Cell: ExpanderCell,
        Header: row => IconHeader(row, mdiDotsHorizontal),
        disableSorting: true,
        id: 'actions',
      },
      */
    ],
    [removeMeetingInstance, toggleModal, updateContactMeeting],
  );

  const controls = useMemo(
    () => [
      <ButtonGroup key="table-contacts-actions">
        <Button
          type="primary"
          icon={mdiPlus}
          data-rh="Add Contact"
          data-rh-at="bottom"
          onClick={() => toggleModal(modals.ADD_CONTACT)}
        />
        <Button
          type="primary"
          icon={mdiUploadOutline}
          data-rh="Upload CSV"
          data-rh-at="bottom"
          onClick={() => toggleModal(modals.UPLOAD_CSV)}
        />
      </ButtonGroup>,
      <ButtonGroup key="table-bulk-actions">
        <Button
          type="secondary"
          icon={mdiTrashCanOutline}
          disabled={!selectedContacts.length}
          data-rh="Delete Contacts"
          data-rh-at="bottom"
          onClick={deleteContacts}
        />
        <Button
          type="secondary"
          icon={mdiCalendarPlus}
          disabled={!selectedContacts.length}
          data-rh="Assign Meeting Tag"
          data-rh-at="bottom"
          onClick={() => toggleModal(modals.ADD_TAG)}
        />
      </ButtonGroup>,
      <span key="table-contacts-count" className={style.count}>
        {`selected contacts: ${selectedContacts.length}`}
      </span>,
    ],
    [deleteContacts, selectedContacts, toggleModal],
  );

  const getEmptyView = useCallback(() => {
    return (
      <EmptyView
        icon={mdiGaugeEmpty}
        view="contacts"
        actions={[
          <Button
            key="actions-add"
            icon={mdiPlus}
            data-rh="Add Contact"
            data-rh-at="bottom"
            onClick={() => toggleModal(modals.ADD_CONTACT)}
          >
            <span>Add Contact</span>
          </Button>,
          <Button
            key="actions-csv"
            icon={mdiUploadOutline}
            data-rh="Upload CSV"
            data-rh-at="bottom"
            onClick={() => toggleModal(modals.UPLOAD_CSV)}
          >
            <span>Upload CSV</span>
          </Button>,
        ]}
      />
    );
  }, [toggleModal]);

  return (
    <div className={style.contacts}>
      <AddContact
        isOpen={isModalOpen.isOpen}
        contact={isModalOpen.contact}
        onContactAdded={handleAddedContact}
        onClose={() => toggleModal(modals.ADD_CONTACT)}
      />
      <ApplyTags
        isOpen={isTagsModalOpen}
        onClose={() => toggleModal(modals.ADD_TAG)}
        contactIds={selectedContacts}
      />
      <UploadCSV
        isOpen={isCSVModalOpen}
        onUpload={handleUpload}
        onClose={() => toggleModal(modals.UPLOAD_CSV)}
      />
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row', style.content, style.cards)}>
          <div className="col-2">
            <TotalCount count={count} />
          </div>
          <div className="col-2">
            <ActiveContacts active={0} count={count} />
          </div>
        </div>
        <div className={cx('row', style.content)}>
          <div className="col-12">
            <Table
              controls={controls}
              noData={getEmptyView()}
              columns={columns}
              data={contacts}
              fetchData={fetchContacts}
              initialPageSize={currentFetchSettings.limit}
              initialSort={currentFetchSettings.sortBy}
              pageCount={pageCount}
              total={count}
              onSelect={setSelectedContacts}
              properties={{
                fluid: true,
                showCount: false,
                showPageSize: true,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

Contacts.propTypes = {
  location: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.object,
    url: PropTypes.string,
  }).isRequired,
};

export { Contacts as default };

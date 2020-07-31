/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  mdiTrashCanOutline,
  mdiPlus,
  mdiEmailEditOutline,
  mdiText,
  mdiGaugeEmpty,
  mdiEmailOutline,
  mdiCalendarOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { AuthContext } from '../auth/AuthContextService';
import Table, {
  CheckboxCell,
  CheckboxHeader,
  EditingCell,
} from '../components/table/Table';
import API from '../props';
import withParameters from '../utils/url';
import { del, get, patch } from '../utils/fetch';
import style from './style.module.scss';
import Card from '../components/card/Card';
import {formatThousands} from '../utils/format';
import Switch from '../components/switch/Switch';
import Button from '../components/button/Button';
import EditTemplate from './editTemplate/EditTemplate';
import NewTemplate from './newTemplate/NewTemplate';
import { useToasts } from '../hooks/notifications/notifications';
import Tag from '../components/tag/Tag';
import { EmptyView } from '../components/genericView/GenericView';

const modals = {
  ADD_TEMPLATE: 'addTemplate',
  UPDATE_TEMPLATE: 'updateTemplate',
};

const templateTypes = {
  EMAIL: 'email',
  INVITE: 'invite',
};

const templateTypesIcons = {
  [templateTypes.EMAIL]: mdiEmailOutline,
  [templateTypes.INVITE]: mdiCalendarOutline,
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [
    isAddTemplateModalOpen,
    setIsAddTemplateModalOpen,
  ] = useState(false);
  const [
    isEditTemplateModalOpen,
    setEditTemplateModalOpen,
  ] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateType, setTemplateType] = useState(
    templateTypes.EMAIL,
  );
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();

  /**
   * @function
   * fetchFields
   * @description
   * fetches paginated fields from server, using a memoized
   * version of the function.
   */
  const fetchFields = useCallback(async () => {
    const qryFields = ['limit', 'offset'];
    const qryFieldsValues = [10, 0];

    const response = await get(
      withParameters(
        API.templates.fields,
        qryFields,
        qryFieldsValues,
      ),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response && response.data) {
      setFields(response.data);
    }
  }, [logout]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  /**
   * @function
   * toggleModal
   * @description
   * Toggles all available modals for Contacts view.
   *
   * @param {modal} string modal to open/close.
   */
  const toggleModal = useCallback(
    modal => {
      document
        .getElementById('kronologic-ai-app')
        .classList.toggle('kronologic--blurred');

      return {
        [modals.ADD_TEMPLATE]: () =>
          setIsAddTemplateModalOpen(!isAddTemplateModalOpen),
        [modals.UPDATE_TEMPLATE]: () =>
          setEditTemplateModalOpen(!isEditTemplateModalOpen),
      }[modal]();
    },
    [isAddTemplateModalOpen, isEditTemplateModalOpen],
  );

  /**
   * @function
   * updateTemplate
   * @description
   * update function
   *
   * @param {*} object row information being updated.
   * @param {id} Number column id, in this case being contact id.
   * @param {column} String column being updated from table row.
   * @param {value} String column value being updated from table row.
   */
  const updateTemplate = useCallback(
    ({ id, column, value }) => {
      return patch(API.templates[templateType].default(id), null, {
        [column]: value,
      });
    },
    [templateType],
  );

  const editTemplateContent = useCallback(
    (templateId, value, type) => {
      setSelectedTemplate({ id: templateId, type, value });
      toggleModal(modals.UPDATE_TEMPLATE);
    },
    [toggleModal],
  );

  /**
   * @function
   * deleteTemplates
   * @description
   * deletes selected contacts
   */
  const deleteTemplates = useCallback(() => {
    selectedTemplates.map(templateID => {
      return del(API.templates[templateType].default(templateID));
    });
  }, [selectedTemplates, templateType]);

  const fetchEmailTemplates = useCallback(
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
          API.templates[templateType].default(),
          qryFields,
          qryFieldsValues,
        ),
      )
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (response && response.data) {
        setTemplates(response.data);
        setCount(response.total);
        setPageCount(Math.ceil(response.total / limit));
      }
    },
    [logout, templateType],
  );

  const columns = useMemo(() => {
    return [
      {
        Cell: CheckboxCell,
        Header: CheckboxHeader,
        id: 'selection',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateTemplate} />
        ),
        Header: 'name',
        accessor: 'name',
      },
      {
        Cell: row => (
          <EditingCell row={row} updateFunc={updateTemplate} />
        ),
        Header: 'title',
        accessor: 'title',
      },
      ...(templateType === templateTypes.INVITE
        ? [
            {
              Cell: row => (
                <EditingCell row={row} updateFunc={updateTemplate} />
              ),
              Header: 'location',
              accessor: 'location',
            },
          ]
        : []),
      {
        Cell: row => {
          return (
            <div className={style.iconCell}>
              <Tag>
                <Icon
                  path={templateTypesIcons[templateType]}
                  size={1}
                />
                <span>{templateType}</span>
              </Tag>
            </div>
          );
        },
        Header: 'Type',
        id: 'type',
      },
      {
        Cell: row => {
          const {
            row: {
              original: { body: value, type, id },
            },
          } = row;

          return (
            <div className={style.editCell}>
              <Button
                icon={mdiEmailEditOutline}
                type="secondary"
                onClick={() => editTemplateContent(id, value, type)}
              />
            </div>
          );
        },
        Header: 'Content',
        accessor: 'id',
        id: 'edit',
      },
    ];
  }, [editTemplateContent, templateType, updateTemplate]);

  const controls = useMemo(
    () => [
      <Button
        key="table-delete-action"
        type="secondary"
        icon={mdiTrashCanOutline}
        disabled={!selectedTemplates.length}
        data-rh="Delete Templates"
        data-rh-at="bottom"
        onClick={deleteTemplates}
      />,
      <Button
        key="table-add-template-action"
        type="primary"
        icon={mdiPlus}
        data-rh="Add Template"
        data-rh-at="bottom"
        onClick={() => toggleModal(modals.ADD_TEMPLATE)}
      >
        <span>Add Template</span>
      </Button>,
    ],
    [deleteTemplates, selectedTemplates.length, toggleModal],
  );

  const handleNewTemplate = useCallback(
    async templateName => {
      toggleModal(modals.ADD_TEMPLATE);
      add(`${templateName} template added`, mdiText);

      await fetchEmailTemplates(10, 0);
    },
    [add, fetchEmailTemplates, toggleModal],
  );

  const toggleUpdateTemplate = useCallback(() => {
    toggleModal(modals.UPDATE_TEMPLATE);
  }, [toggleModal]);

  const toggleAddTemplate = useCallback(() => {
    toggleModal(modals.ADD_TEMPLATE);
  }, [toggleModal]);

  const getEmptyView = useCallback(() => {
    return (
      <EmptyView
        icon={mdiGaugeEmpty}
        view="templates"
        actions={[
          <Button
            key="actions-add"
            icon={mdiPlus}
            onClick={() => toggleModal(modals.ADD_TEMPLATE)}
          >
            <span>Add Template</span>
          </Button>,
        ]}
      />
    );
  }, [toggleModal]);

  return (
    <div className={style.templates}>
      <EditTemplate
        fields={fields}
        isOpen={isEditTemplateModalOpen}
        onClose={toggleUpdateTemplate}
        id={selectedTemplate?.id}
        type={templateType}
      />
      <NewTemplate
        fields={fields}
        isOpen={isAddTemplateModalOpen}
        onSuccess={handleNewTemplate}
        onClose={toggleAddTemplate}
      />
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row', style.content, style.cards)}>
          <div className="col-2">
            <Card>
              <div className={style.cardContent}>
                <header>
                  <h3>{formatThousands(count)[0]}</h3>
                </header>
                <div className={cx(style.subHeader)}>
                  total templates
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className={cx('row', style.content)}>
          <div className="col-12">
            <Table
              controls={controls}
              columns={columns}
              data={templates}
              fetchData={fetchEmailTemplates}
              noData={getEmptyView()}
              initialSort={[
                {
                  desc: false,
                  id: 'name',
                },
              ]}
              pageCount={pageCount}
              total={count}
              onSelect={setSelectedTemplates}
              properties={{
                canDeleteAll: false,
                fluid: true,
                showCount: false,
                showPageSize: false,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

Templates.propTypes = {
  location: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export { Templates as default };

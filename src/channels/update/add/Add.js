/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose, mdiArrowDecisionOutline, mdiPlus } from '@mdi/js';
import Select from 'react-dropdown-select';
import style from './style.module.scss';
import { AuthContext } from '../../../auth/AuthContextService';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';
import { get, post } from '../../../utils/fetch';
import API from '../../../props';
import useInput from '../../../hooks/useInput';
import Switch from '../../../components/switch/Switch';
import { compareValues } from '../../../utils/array';
import Dropdown from '../../../components/dropdown/Dropdown';

const contactTypes = [
  {
    type: 'contact',
  },
  {
    type: 'lead',
  },
  {
    type: 'opportunity',
  },
];

const meetingStatusTypes = [
  {
    status: 'accepted',
  },
  {
    status: 'activated',
  },
  {
    status: 'cancelled',
  },
  {
    status: 'deactivated',
  },
  {
    status: 'declined',
  },
  {
    status: 'requires user intervention',
  },
];

const Condition = lazy(() => import('./Condition'));
const blankField = { condition: '', field: '', value: '' };

ReactModal.setAppElement('#kronologic-ai-app');

const Add = ({ isOpen, onClose, onChannelAdded }) => {
  const { values, bind, reset } = useInput({});
  const { logout } = useContext(AuthContext);
  const [conditions, setConditions] = useState([{ ...blankField }]);
  const [active, setActive] = useState(false);
  const [salesforce, setSalesforce] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [meetingDef, setMeetingDef] = useState(null);
  const [integration, setIntegration] = useState({
    id: null,
  });
  const [contactType, setContactType] = useState({
    type: null,
  });
  const [meetingStatus, setMeetingStatus] = useState('');
  const [fields, setFields] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const history = useHistory();

  const gotoIntegrations = () => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');
    history.push('/integrations');
  };

  const gotoMeetingDefs = () => {
    document
      .getElementById('kronologic-ai-app')
      .classList.toggle('kronologic--blurred');
    history.push('/meetings');
  };

  const toggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiArrowDecisionOutline} size={2} />
        <span>Update Channel</span>
        <div className={style.headerActions}>
          <span>enable</span>
          <Switch
            size="small"
            isOn={active}
            handleToggle={toggleActive}
          />
        </div>
      </div>
    );
  };

  const formatConditions = useCallback(() => {
    if (conditions && conditions.length) {
      const cleanConditions = [
        ...conditions.filter(c => {
          return c.value !== '' && c.field !== '';
        }),
      ];

      return cleanConditions.map(condition => {
        return {
          action: {
            field: condition.field,
            object: contactType.type,
            value: condition.value,
          },
          event: {
            field: 'status',
            object: 'meeting',
            value: meetingStatus.status,
          },
        };
      });
    }

    return [];
  }, [conditions, contactType.type, meetingStatus.status]);

  const create = async () => {
    const response = await post(API.channels.update(), null, {
      ...values,
      config: {
        trigger: formatConditions(),
      },
      enabled: active,
      integration: integration.id,
      meeting: meetingDef,
      type: 'update',
    })
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      onChannelAdded();
    }
  };

  const validate = useCallback(() => {
    const validateFilters = formatConditions().length > 0;
    const validateValues =
      values.name !== '' && values.description !== '';
    const validateIntegration = !!integration?.id;
    const validateMeeting = meetingDef !== null;
    const validateContactType = !!contactType?.type;
    const validateStatusType = !!meetingStatus?.status;

    if (
      validateFilters &&
      validateMeeting &&
      validateValues &&
      validateIntegration &&
      validateContactType &&
      validateStatusType
    ) {
      setCanCreate(true);
    }
  }, [
    contactType,
    formatConditions,
    integration,
    meetingDef,
    meetingStatus,
    values.description,
    values.name,
  ]);

  const addCondition = useCallback(
    (index, row) => {
      let conds = [...conditions];
      conds = conds.map((obj, i) => (i === index ? row : obj));
      setConditions([...conds]);
    },
    [conditions],
  );

  const addNewCondition = useCallback(() => {
    setConditions([...conditions, { ...blankField }]);
  }, [conditions]);

  const delCondition = useCallback(
    index => {
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      setConditions(newConditions);
    },
    [conditions],
  );

  const fetchLeadFields = useCallback(async () => {
    const response = await get(
      API.integrations.salesforce.oFields(
        integration.id,
        contactType.type,
      ),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      setFields(response.object_fields.sort(compareValues('name')));
    }
  }, [contactType, integration, logout]);

  const fetchMeetings = useCallback(async () => {
    const response = await get(API.meetings.default())
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response && response.data) {
      setMeetings(response.data);
    }
  }, [logout]);

  const fetchIntegrations = useCallback(async () => {
    const response = await get(API.integrations.default())
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      const salesforceFound = response.find(
        i => i.name === 'salesforce',
      );

      if (salesforceFound) {
        setSalesforce(salesforceFound);
      }
    }
  }, [logout]);

  useEffect(() => {
    fetchIntegrations();
    fetchMeetings();
  }, [fetchIntegrations, fetchMeetings]);

  const selectMeetingDefs = useCallback(defs => {
    setMeetingDef(defs.map(t => t.id)[0]);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIntegration(null);
      setFields([]);
      setConditions([{ ...blankField }]);
      setCanCreate(false);
      reset();
    }
  }, [canCreate, isOpen, reset]);

  useEffect(() => {
    validate();

    if (integration?.id && contactType?.type) {
      fetchLeadFields();
    }
  }, [
    conditions,
    values,
    integration,
    validate,
    contactType,
    fetchLeadFields,
  ]);

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
        className={cx('container is--fluid', style.addChannelsModal)}
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
          <div className="col-6 col-offset-3">
            <Card header={<ModalHeader />}>
              <div className="row">
                <div className="col-12">
                  <div className="form--inline">
                    <label htmlFor="name">
                      <input
                        placeholder="Name"
                        type="text"
                        name="name"
                        {...bind}
                      />
                    </label>
                    <label htmlFor="description">
                      <input
                        placeholder="Description..."
                        type="text"
                        name="description"
                        {...bind}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
            <Card className={style.detailsCard}>
              <header>
                <span className={style.title}>
                  When contact associated with meeting type
                </span>
              </header>
              <div className="row">
                <div className="col-12">
                  <div className="form--inline">
                    <label htmlFor="name">
                      {meetings.length ? (
                        <Select
                          name="meetingDefs"
                          labelField="name"
                          valueField="id"
                          searchBy="name"
                          clearable={false}
                          options={meetings.map(m => ({
                            id: m.id,
                            name: m.name,
                          }))}
                          onChange={selectMeetingDefs}
                        />
                      ) : (
                        <Button
                          type="tertiary"
                          onClick={gotoMeetingDefs}
                        >
                          <span>Meeting</span>
                        </Button>
                      )}
                    </label>

                    <span className={style.inlineLbl}>type</span>
                    <label htmlFor="type">
                      <Dropdown
                        label="Select..."
                        labelProp="type"
                        valueProp="type"
                        data={contactTypes}
                        onSelect={setContactType}
                        selectItem={contactType}
                      />
                    </label>

                    <span className={style.inlineLbl}>Is</span>
                    <label htmlFor="name">
                      <Dropdown
                        label="Select..."
                        labelProp="status"
                        valueProp="status"
                        data={meetingStatusTypes}
                        onSelect={setMeetingStatus}
                        selectItem={meetingStatus || ''}
                      />
                    </label>

                    <span className={style.inlineLbl}>From</span>
                    <label htmlFor="name">
                      {salesforce ? (
                        <Dropdown
                          label="Select..."
                          labelProp="integration"
                          valueProp="id"
                          data={[
                            {
                              id: salesforce?.id,
                              integration: salesforce?.name,
                            },
                          ]}
                          onSelect={setIntegration}
                          selectItem={integration || ''}
                        />
                      ) : (
                        <Button
                          type="tertiary"
                          onClick={gotoIntegrations}
                        >
                          <span>Create Integration</span>
                        </Button>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col-6 col-offset-3">
            <Suspense fallback={<span />}>
              {conditions.map((condition, i) => {
                return (
                  <Condition
                    fields={fields}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`condition-${i}`}
                    index={i}
                    total={conditions.length}
                    addConditionFunc={addNewCondition}
                    delConditionFunc={delCondition}
                    value={condition}
                    onChange={addCondition}
                  />
                );
              })}
            </Suspense>
            <div className="row">
              <div
                className={cx('col-4 col-offset-8', style.actions)}
              >
                <Button
                  disabled={!canCreate}
                  icon={mdiPlus}
                  type="primary"
                  onClick={create}
                >
                  <span>Channel</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

Add.propTypes = {
  isOpen: PropTypes.bool,
  onChannelAdded: PropTypes.func,
  onClose: PropTypes.func,
};

Add.defaultProps = {
  isOpen: false,
  onChannelAdded: () => {},
  onClose: () => {},
};

export { Add as default };

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
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiArrowDecisionOutline,
  mdiPlus,
  mdiCheck,
} from '@mdi/js';
import style from './style.module.scss';
import { AuthContext } from '../../../auth/AuthContextService';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';
import { get, patch } from '../../../utils/fetch';
import API from '../../../props';
import useInput from '../../../hooks/useInput';
import Switch from '../../../components/switch/Switch';
import { compareValues } from '../../../utils/array';
import Dropdown from '../../../components/dropdown/Dropdown';

const Condition = lazy(() => import('./Condition'));

const blankField = { condition: '', field: '', value: '' };

ReactModal.setAppElement('#kronologic-ai-app');

const Update = ({ isOpen, onClose, onUpdate, channelId }) => {
  const { values, bind, reset, setValues } = useInput({
    description: '',
    name: '',
  });
  const { logout } = useContext(AuthContext);
  const [conditions, setConditions] = useState([]);
  const [active, setActive] = useState(false);
  const [salesforce, setSalesforce] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [meetingDef, setMeetingDef] = useState(null);
  const [integrationId, setIntegrationId] = useState(null);
  const [fields, setFields] = useState([]);

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

  const formatConditions = () => {
    if (conditions && conditions.length) {
      const cleanConditions = [
        ...conditions.filter(c => {
          return (
            c.value !== '' && c.field !== '' && c.condition !== ''
          );
        }),
      ];

      return cleanConditions.map(condition => {
        return {
          conditions: [
            {
              comparison: {
                key: condition.condition,
              },
              field: {
                label: condition.field,
                name: condition.field,
              },
              value: {
                label: condition.value,
              },
            },
          ],
        };
      });
    }

    return [];
  };

  const update = async () => {
    const response = await patch(
      API.channels.default(channelId),
      null,
      {
        ...values,
        enabled: active,
        import_filters: formatConditions(),
        integration: integrationId,
        meeting: meetingDef,
      },
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      onUpdate();
    }
  };

  useEffect(() => {
    if (channelId) {
      const fetchChannel = async () => {
        const response = await get(API.channels.default(channelId))
          .then(res => res.json())
          .catch(e => {
            if (e.message === '401') {
              logout();
            }
          });

        if (response) {
          const {
            description,
            import_filters: filters,
            name,
            enabled,
            integration,
            meeting,
          } = response;

          setValues({
            description,
            name,
          });

          if (filters.length) {
            const allConditions = filters[0].conditions;

            setConditions([
              ...allConditions.map(c => ({
                condition: c.comparison.key,
                field: c.field.label,
                value: c.value.label,
              })),
            ]);
          }

          setActive(enabled);
          setIntegrationId(integration.id);
          setMeetingDef(meeting.id);
        }
      };

      const fetchIntegrations = async () => {
        const getLeads = async id => {
          const response = await get(
            API.integrations.salesforce.leadFields(id),
          )
            .then(res => res.json())
            .catch(e => {
              if (e.message === '401') {
                logout();
              }
            });

          if (response) {
            setFields(
              response.lead_fields.sort(compareValues('name')),
            );
          }
        };

        const response = await get(API.integrations.default())
          .then(res => res.json())
          .catch(e => {
            if (e.message === '401') {
              logout();
            }
          });

        if (response) {
          const salesforceFound = response.find(
            integration => integration.name === 'salesforce',
          );

          if (salesforceFound) {
            setSalesforce(salesforceFound);

            getLeads(salesforceFound.id);
          }
        }
      };

      const fetchMeetings = async () => {
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
      };

      fetchChannel();
      fetchIntegrations();
      fetchMeetings();
    }
  }, [channelId, logout, setValues]);

  const toggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  const ModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiArrowDecisionOutline} size={2} />
        <span>Update Channel</span>
        <div className={style.headerActions}>
          <span>activate</span>
          <Switch isOn={active} handleToggle={toggleActive} />
        </div>
      </div>
    );
  };

  const handleIntegrationChange = integration => {
    setIntegrationId(integration.id);
  };

  const handleDefinitionChange = def => {
    setMeetingDef(def.id);
  };

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
              <form>
                <div className="row">
                  <div className="col-12">
                    <div className="form--inline">
                      <label htmlFor="name">
                        <input
                          placeholder="Name"
                          type="text"
                          name="name"
                          value={values.name}
                          {...bind}
                        />
                      </label>
                      <label htmlFor="description">
                        <input
                          placeholder="Description..."
                          type="text"
                          name="description"
                          value={values.description}
                          {...bind}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="form--inline">
                      <label htmlFor="name">
                        <span>Integration</span>
                        <Dropdown
                          data={[
                            {
                              id: salesforce?.id,
                              integration: salesforce?.name,
                            },
                          ]}
                          labelProp="integration"
                          valueProp="id"
                          selectItem={integrationId || ''}
                          onSelect={handleIntegrationChange}
                        />
                      </label>
                      <label htmlFor="name">
                        <span>Meeting Definitions</span>
                        <Dropdown
                          data={meetings.map(m => ({
                            id: m?.id,
                            name: m?.name,
                          }))}
                          labelProp="name"
                          valueProp="id"
                          selectItem={meetingDef || ''}
                          onSelect={handleDefinitionChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </form>
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
                  icon={mdiCheck}
                  type="primary"
                  onClick={update}
                >
                  <span>Update</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ReactModal>
  );
};

Update.propTypes = {
  channelId: PropTypes.number,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onUpdate: PropTypes.func,
};

Update.defaultProps = {
  channelId: null,
  isOpen: false,
  onClose: () => {},
  onUpdate: () => {},
};

export { Update as default };

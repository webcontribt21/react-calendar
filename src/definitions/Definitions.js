/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { mdiPlus, mdiGaugeEmpty, mdiCalendarOutline } from '@mdi/js';
import Icon from '@mdi/react';
import shortid from 'shortid';
import MeetingItem from './meetingItem/MeetingItem';
import { del, patch, post, get } from '../utils/fetch';
import API from '../props';
import { AuthContext } from '../auth/AuthContextService';
import style from './style.module.scss';
import { Tabs, Tab } from '../components/tabs/Tabs';
import Button, { ButtonGroup } from '../components/button/Button';
import {
  EmptyView,
  LoadingCard,
} from '../components/genericView/GenericView';
import { useToasts } from '../hooks/notifications/notifications';
import { SYSTEM_FIELDS, SYSTEM_FIELDS_SAMPLES } from './props';
import { compareValues } from '../utils/array';
import withParameters from '../utils/url';
import storage from '../utils/storage';
import { formatCurrency } from '../utils/format';

const Definition = lazy(() => import('./mgmt/Definition'));
const TeamRouting = lazy(() => import('./teamRouting/TeamRouting'));

function definitionObj() {
  return {
    active: true,
    buffer_duration_mins: 3 * 60,
    description: '0',
    distribution: '',
    emailTemplates: [
      {
        body: 'email template content...',
        order: 1,
        title: '',
      },
    ],
    id: shortid.generate(),
    inviteTemplates: [
      {
        location: '',
        notes: 'invite template content...',
        title: '',
      },
    ],
    name: 'new definition',
    properties: {
      dayRange: {
        // 1 - 30
        from: 1,
        to: 30,
      },
      duration: 30, // 15, 30, 45, 60
      gap: 0, // 0, 15, 30, 45, 60
    },
    rawRoutingLogic: [],
    recycle_after_hours: 0,
    routing: '',
    routing_logic: {},
    team: { id: 0 },
  };
}

const routes = {
  DEFINITION: '/meetings/definitions',
  TEAM: '/meetings/team',
};

function DefinitionHeader({ name, description, onValueChange }) {
  const [editing, isEditing] = useState(false);
  const toggleEditing = () => {
    isEditing(!editing);
  };
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className={style.mainHeader}>
            <label>
              <input
                type="text"
                name="name"
                placeholder="name"
                value={name}
                onChange={onValueChange}
                className={style.defName}
              />
            </label>
            <label className={style.amount}>
              <span>Per Meeting Value:</span>
              {editing ? (
                <input
                  type="number"
                  name="description"
                  placeholder="0"
                  value={description}
                  onChange={onValueChange}
                  onBlur={toggleEditing}
                />
              ) : (
                <Button type="text" onClick={toggleEditing}>
                  {formatCurrency(description)}
                </Button>
              )}
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

DefinitionHeader.propTypes = {
  description: PropTypes.string,
  name: PropTypes.string,
  onValueChange: PropTypes.func,
};

DefinitionHeader.defaultProps = {
  description: '0.00',
  name: '',
  onValueChange: () => {},
};

function Definitions() {
  const [loading, isLoading] = useState(true);
  const [selectedTab, setTab] = useState(routes.DEFINITION);
  const [fields, setFields] = useState([
    ...Object.values(SYSTEM_FIELDS).map(f => ({
      field: f,
      sample: SYSTEM_FIELDS_SAMPLES[f],
      value: f,
    })),
  ]);
  const [selected, setSelected] = useState(0);
  const { logout } = useContext(AuthContext);
  const [definitions, setDefinitions] = useState([]);
  const store = storage();

  const { add } = useToasts();

  const handleTabChange = useCallback(path => {
    setTab(path);
  }, []);

  const fetchDefinitions = useCallback(() => {
    return get(API.meetings.default())
      .then(res => res.json())
      .then(response => {
        if (response?.data.length) {
          const data = [...response.data];
          data.sort(compareValues('id'));
          setDefinitions(data);
        }
      })
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });
  }, [logout]);

  const reset = async () => {
    await fetchDefinitions();
    store.remove('invite');
    store.remove('emails');
  };

  const deleteEmailTemplate = useCallback(
    async emailId => {
      const response = await del(
        withParameters(
          API.templates.email.default(),
          ['ids'],
          [emailId],
        ),
      )
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });
    },
    [logout],
  );

  const fetchFields = useCallback(() => {
    return get(API.appSettings.default)
      .then(res => res.json())
      .then(response => {
        if (response?.fields) {
          setFields([...fields, response.fields]);
        }
      })
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });
  }, [fields, logout]);

  useEffect(() => {
    const fetchAll = async () => {
      isLoading(true);

      await fetchDefinitions();
      await fetchFields();

      isLoading(false);
    };

    fetchAll();
    store.remove('invite');
    store.remove('emails');

    return () => {
      store.remove('invite');
      store.remove('emails');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDefinitions]);

  const addNewMeetingDefinition = () => {
    setDefinitions([...definitions, { ...definitionObj() }]);
    setSelected(definitions.length);
  };

  const handleDefinitionChange = () => {
    add('Definition updated', mdiCalendarOutline);
    reset();
  };

  /**
   * @function
   * remove
   * @description
   * remove meeting definition given a meeting_definition id.
   *
   * @returns Promise
   */
  const remove = async () => {
    const { id } = definitions[selected];

    if (id && Number.isInteger(id)) {
      const response = await del(API.meetings.default(id))
        .then(res => res.json())
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      if (response) {
        handleDefinitionChange();
      }
    } else {
      const sel = selected;

      setDefinitions([
        ...definitions.filter((_, index) => index !== sel),
      ]);

      const invite = store.get('invite');
      const emails = store.get('emails');

      if (invite?.id === id || emails?.id === id) {
        store.remove('invite');
        store.remove('emails');
      }

      setSelected(definitions.length - 1);
    }
  };

  const publish = async () => {
    const { id, rawRoutingLogic, ...definition } = definitions[
      selected
    ];
    const routingTeam =
      definition.distribution || definition.routingTeam;
    const routingType = definition.routing || definition.routingType;

    let routingLogic = null;
    if (rawRoutingLogic) {
      if (routingType === 'sequential') {
        routingLogic = {
          sequential: {
            order: rawRoutingLogic.map(rl => rl.user.id),
          },
        };
      } else if (routingType === 'custom') {
        const custom = rawRoutingLogic.map(u => {
          return {
            [`${u.user.id}`]: {
              enabled: u.enabled,
              mapping_logic: u.conditions,
            },
          };
        });

        routingLogic = {
          custom: {
            ...custom.reduce((acc, val, index) => ({
              ...acc,
              ...val,
            })),
          },
        };
      }
    }

    let url = API.meetings.default();
    let method = post;

    if (id && Number.isInteger(id)) {
      url = API.meetings.default(id);
      method = patch;
    }

    const emails =
      (store.get('emails') && store.get('emails').value) ||
      definition.emailTemplates;
    const invite =
      (store.get('invite') &&
        store.get('invite').value && [store.get('invite').value]) ||
      definition.inviteTemplates;

    const response = await method(url, null, {
      ...definition,
      emailTemplates: emails.map(email => {
        if (email.id && !Number.isInteger(email.id)) {
          const { id: _, ...restEmail } = email;
          return {
            ...restEmail,
          };
        }

        return {
          ...email,
        };
      }),
      enabled: definition.active,
      inviteTemplates: [
        {
          ...invite[0],
          ...(invite[0].text ? { notes: invite[0].text } : {}),
        },
      ],
      routingTeam,
      routingType,
      routing_logic: routingLogic || definition.routing_logic,
      team: definition.team.id || definition.team,
    })
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      handleDefinitionChange();
    }
  };

  const onDefinitionChange = row => {
    setDefinitions([
      ...definitions.map((def, index) => {
        if (index === selected) {
          return {
            ...def,
            ...row,
          };
        }

        return def;
      }),
    ]);
  };

  const setEnable = isEnable => {
    onDefinitionChange({
      enabled: isEnable,
    });
  };

  const addEmailTemplate = emailTemplates => {
    const { id } = definitions[selected];

    onDefinitionChange({
      emailTemplates: [
        ...emailTemplates,
        {
          body: 'email template content...',
          id: shortid.generate(),
          order: emailTemplates.length + 1,
          title: '',
        },
      ],
    });

    store.add('emails', [
      ...emailTemplates,
      {
        body: 'email template content...',
        id: shortid.generate(),
        order: emailTemplates.length + 1,
        title: '',
      },
    ]);
  };

  const removeEmailTemplate = (emailTemplates, emailId) => {
    const { id } = definitions[selected];

    onDefinitionChange({
      emailTemplates: [
        ...emailTemplates.filter(et => et.id !== emailId),
      ],
    });

    if (id && Number.isInteger(id)) {
      store.add('emails', [
        ...emailTemplates.filter(et => et.id !== emailId),
      ]);

      if (emailId && Number.isInteger(emailId)) {
        deleteEmailTemplate(emailId);
      }
    }
  };

  const onChange = event => {
    const {
      target: { name, value },
    } = event;

    onDefinitionChange({ [name]: value });
  };

  const onBufferChange = value => {
    onDefinitionChange({ buffer_duration_mins: value * 60 });
  };

  const onTeamChange = (rawRoutingLogic, team) => {
    onDefinitionChange({ rawRoutingLogic, team });
  };

  const onRoutingChange = routing => {
    onDefinitionChange({
      routing: (routing && routing.id.toLowerCase()) || '',
    });
  };

  const onRoutingLogicChange = routingJson => {
    onDefinitionChange({
      rawRoutingLogic: routingJson,
    });
  };

  const onDistributionChange = dist => {
    onDefinitionChange({
      distribution: (dist && dist.id.toLowerCase()) || '',
    });
  };

  const onPropertiesChange = props => {
    const { properties } = definitions[selected];

    onDefinitionChange({
      properties: {
        ...properties,
        ...props,
      },
    });
  };

  return (
    <div className={style.jobs}>
      <section className={cx('container', 'is--fluid')}>
        <div className="row">
          {!definitions.length && loading && <LoadingCard />}
          {definitions.length > 0 && (
            <div className="col-2">
              <div className={style.meetings}>
                {definitions.map((meeting, i) => {
                  return (
                    <MeetingItem
                      selected={i === selected}
                      data={meeting}
                      key={`meeting-id-${meeting.id}`}
                      onClick={() => setSelected(i)}
                      onToggle={setEnable}
                      onDelete={remove}
                    />
                  );
                })}
              </div>
              <div className={style.actions}>
                <Button
                  type="tertiary"
                  onClick={addNewMeetingDefinition}
                >
                  <Icon
                    path={mdiPlus}
                    size={2}
                    className={style.close}
                  />
                </Button>
              </div>
            </div>
          )}
          <div
            className={definitions.length > 0 ? 'col-10' : 'col-12'}
          >
            {definitions.length > 0 && (
              <>
                <div className="row">
                  <div className="col-5 col-offset-3">
                    <DefinitionHeader
                      id={definitions[selected]?.id}
                      description={definitions[selected]?.description}
                      name={definitions[selected]?.name}
                      onValueChange={onChange}
                    />
                  </div>
                  <div className="col-4">
                    <div className={style.mainActions}>
                      <ButtonGroup>
                        <Button type="secondary" onClick={reset}>
                          <span>Reset</span>
                        </Button>
                        <Button onClick={publish}>
                          <span>Publish</span>
                        </Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <Tabs className={[style.content]}>
                      <Tab
                        index={routes.DEFINITION}
                        title="templates"
                        onClick={() =>
                          handleTabChange(routes.DEFINITION)
                        }
                        active={selectedTab === routes.DEFINITION}
                      />
                      <Tab
                        index={routes.TEAM}
                        title="scheduling"
                        onClick={() => handleTabChange(routes.TEAM)}
                        active={selectedTab === routes.TEAM}
                      />
                    </Tabs>
                    <Suspense fallback={<span />}>
                      {selectedTab === routes.DEFINITION &&
                        definitions.length > 0 && (
                          <Definition
                            data={definitions[selected]}
                            dynamicFields={fields}
                            onAddEmailTemplate={addEmailTemplate}
                            onRemoveEmailTemplate={
                              removeEmailTemplate
                            }
                          />
                        )}
                      {selectedTab === routes.TEAM &&
                        definitions.length > 0 && (
                          <TeamRouting
                            routingLogic={
                              // eslint-disable-next-line camelcase
                              definitions[selected]?.routing_logic
                            }
                            rawRoutingLogic={
                              definitions[selected]?.rawRoutingLogic
                            }
                            routing={
                              definitions[selected]?.routing ||
                              definitions[selected]?.routingType
                            }
                            distribution={
                              definitions[selected]?.routingTeam ||
                              definitions[selected]?.distribution
                            }
                            team={definitions[selected]?.team?.id}
                            onTeamChange={onTeamChange}
                            onRoutingChange={onRoutingChange}
                            onRoutingLogicChange={
                              onRoutingLogicChange
                            }
                            onDistributionChange={
                              onDistributionChange
                            }
                            buffer={
                              definitions[selected] // eslint-disable-next-line camelcase
                                ?.buffer_duration_mins
                            }
                            onBufferChange={onBufferChange}
                            properties={
                              definitions[selected]?.properties
                            }
                            onPropertiesChange={onPropertiesChange}
                          />
                        )}
                    </Suspense>
                  </div>
                </div>
              </>
            )}

            {selectedTab === routes.DEFINITION &&
              definitions.length < 1 &&
              !loading && (
                <EmptyView
                  icon={mdiGaugeEmpty}
                  view="meeting definitions"
                  actions={[
                    <Button
                      key="actions-add-team"
                      icon={mdiPlus}
                      onClick={addNewMeetingDefinition}
                    >
                      <span>Add Meeting Definition</span>
                    </Button>,
                  ]}
                />
              )}
          </div>
        </div>
      </section>
    </div>
  );
}

export { Definitions as default };

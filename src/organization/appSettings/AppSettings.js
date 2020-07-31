/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from 'react-dropdown-select';
import { mdiPlus, mdiCheck, mdiSettingsOutline } from '@mdi/js';
import shortid from 'shortid';
import useInput from '../../hooks/useInput';
import API from '../../props';
import style from './style.module.scss';
import { get, patch } from '../../utils/fetch';
import { AuthContext } from '../../auth/AuthContextService';
import Card from '../../components/card/Card';
import Checkbox from '../../components/checkbox/Checkbox';
import timezones from '../../assets/data/timezones';
import Button from '../../components/button/Button';
import { useToasts } from '../../hooks/notifications/notifications';
import { compareValues } from '../../utils/array';

const flatten = arr => {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten,
    );
  }, []);
};

const tmzData = [...new Set(flatten(timezones.map(t => t.utc)))].map(
  t => ({
    utc: t,
  }),
);

const Fields = ({ data, onChange }) => {
  const [lbls, setLbls] = useState([]);
  const [values, setValues] = useState([]);

  const handleChange = useCallback(event => {
    const {
      target: { name, value },
    } = event;
  }, []);

  return data.map((field, i) => {
    return (
      <li key={`field-id-${shortid.generate()}`}>
        <div className="form--inline">
          <label htmlFor={`field-lbl-${i}`}>
            <span>Name</span>
            <input
              name={`field-lbl-${i}`}
              defaultValue={field.label}
              onChange={handleChange}
            />
          </label>
          <label htmlFor={`field-val-${i}`}>
            <span>Value</span>
            <input
              name={`field-val-${i}`}
              defaultValue={field.value}
              onChange={handleChange}
            />
          </label>
        </div>
      </li>
    );
  });
};

Fields.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
};

Fields.defaultProps = {
  data: [],
  onChange: () => {},
};

const AppSettings = () => {
  const { logout } = useContext(AuthContext);
  const { add } = useToasts();
  const { values, bind, setValues } = useInput({
    sendUnsubscribe: false,
    timeNegotiationEnabled: false,
  });
  const [fields, setFields] = useState([{ label: '', value: '' }]);
  const [tmz, setTMZ] = useState(null);
  const [allSettings, setAllSettings] = useState(null);

  const update = useCallback(async () => {
    const { scheduler, ...settings } = allSettings;

    const response = await patch(API.appSettings.default, null, {
      ...settings,
      ...values,
      timezone: tmz,
    }).catch(e => {
      if (e.message === '401') {
        logout();
      }
    });

    if (response.ok) {
      add('Settings updated', mdiSettingsOutline);
    }
  }, [add, allSettings, logout, tmz, values]);

  const fetchSettings = useCallback(async () => {
    const response = await get(API.appSettings.default)
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      const tmzItem = tmzData.find(z => {
        return z.utc === response.timezone;
      });

      setAllSettings(response);
      setValues({
        sendUnsubscribe: response.sendUnsubscribe,
        timeNegotiationEnabled: response.timeNegotiationEnabled,
        timezone: tmzItem,
      });
      // setSettings(response.data);
    }
  }, [logout, setValues]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const addField = useCallback(() => {
    setFields([
      ...fields,
      {
        label: '',
        value: '',
      },
    ]);
  }, [fields]);

  const Header = () => {
    return (
      <div className={style.header}>
        <span>App settings</span>
        <div className={style.headerActions}>
          <Button icon={mdiCheck} onClick={update}>
            <span>Update</span>
          </Button>
        </div>
      </div>
    );
  };

  const addTMZ = useCallback(addedTMZ => {
    setTMZ(addedTMZ[0]?.utc);
  }, []);

  const handleFieldsChange = data => {
    // no-op
  };

  return (
    <Card header={<Header />}>
      <div className={cx('row', style.appSettings)}>
        <div className="col-12">
          <section className={style.setting}>
            <header>
              <h3>general</h3>
              <div className={style.help}>
                Change general parts of the application.
              </div>
            </header>
            <div className="row">
              <div className="col-6">
                <ul className={style.content}>
                  <li>
                    <Checkbox
                      checked={values.timeNegotiationEnabled}
                      name="timeNegotiationEnabled"
                      onChange={bind.onChange}
                    />
                    <span>time negotiation enabled</span>
                  </li>
                  <li>
                    <Checkbox
                      defaultChecked={values.sendUnsubscribe}
                      name="sendUnsubscribe"
                      {...bind}
                    />
                    <span>send unsubscribe links</span>
                  </li>
                  <li>
                    <label htmlFor="timezone">
                      <span>Timezone</span>
                      <Select
                        values={
                          values.timezone ? [values.timezone] : []
                        }
                        searchable
                        searchBy="utc"
                        name="timezone"
                        valueField="utc"
                        labelField="utc"
                        options={tmzData}
                        addPlaceholder="Search"
                        onChange={addTMZ}
                      />
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className={style.setting}>
            <header>
              <h3>custom fields</h3>
              <div className={style.help}>
                Add or remove custom fields for templates.
              </div>
            </header>
            <div className="row">
              <div className="col-6">
                <ul className={style.content}>
                  <Fields
                    data={fields}
                    onChange={handleFieldsChange}
                  />
                  <li>
                    <Button
                      type="secondary"
                      icon={mdiPlus}
                      onClick={addField}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
};

export { AppSettings as default };

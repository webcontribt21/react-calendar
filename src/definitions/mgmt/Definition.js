/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { mdiPlus, mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import { Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import style from './style.module.scss';
import Button from '../../components/button/Button';
import storage from '../../utils/storage';
import { useToasts } from '../../hooks/notifications/notifications';

const EmailTemplate = lazy(() => import('./templates/EmailTemplate'));
const InviteTemplate = lazy(() =>
  import('./templates/InviteTemplate'),
);

function DynamicField({ field, value, sample }) {
  const { add } = useToasts();
  const handleInsert = useCallback(() => {
    copy(`{{${value}}}`);
    add(`Copied value: ${value}`, mdiContentCopy);
  }, [add, value]);

  return (
    <Button type="secondary" onClick={handleInsert}>
      <div className={style.field}>
        {field}
        {sample && <div className={style.sample}>{sample}</div>}
      </div>
    </Button>
  );
}

DynamicField.propTypes = {
  field: PropTypes.string,
  sample: PropTypes.string,
  value: PropTypes.string,
};

DynamicField.defaultProps = {
  field: '',
  sample: null,
  value: '',
};

function Definition({
  data,
  dynamicFields,
  onAddEmailTemplate,
  onRemoveEmailTemplate,
}) {
  const store = storage();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [inviteValues, setInviteValues] = useState({});

  const handleInviteEditorChangeOld = (
    content,
    _,
    source,
    ref,
    text,
  ) => {
    if (source === 'user') {
      // setNotes(content);
      setInviteValues({
        ...inviteValues,
        notes: content,
        text,
      });
      store.add('invite', {
        id: data.id,
        value: {
          ...inviteValues,
          notes: content,
          text,
        },
      });
    }
  };

  const handleInviteEditorChange = event => {
    const {
      target: { value },
    } = event;

    setInviteValues({
      ...inviteValues,
      notes: value,
      text: value,
    });
    store.add('invite', {
      id: data.id,
      value: {
        ...inviteValues,
        notes: value,
        text: value,
      },
    });
  };

  const handleInviteFieldsChange = event => {
    const { target } = event;
    const row = { [target.name]: target.value };

    setInviteValues({
      ...inviteValues,
      ...row,
    });
    store.add('invite', {
      id: data.id,
      value: {
        ...inviteValues,
        ...row,
      },
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEmailFieldsChange = (event, order, name, value) => {
    if (event) {
      const { target } = event;
      const row = { [target.name]: target.value };

      const emails = [...emailTemplates].map(e =>
        e.order === order ? { ...e, ...row } : e,
      );

      setEmailTemplates([...emails]);
      store.add('emails', {
        id: data.id,
        value: [...emails],
      });
    } else {
      const row = { [name]: value };
      const emails = [...emailTemplates].map(e =>
        e.order === order ? { ...e, ...row } : e,
      );

      setEmailTemplates([...emails]);
      store.add('emails', {
        id: data.id,
        value: [...emails],
      });
    }
  };

  const onEmailBodyChange = (body, order, source) => {
    if (source === 'user') {
      const email = [...emailTemplates].find(
        e => e.order === order && e.body !== body,
      );

      if (email) {
        const emails = [...emailTemplates].map(e =>
          e.order === order ? { ...e, body } : e,
        );

        setEmailTemplates([...emails]);
        store.add('emails', {
          id: data.id,
          value: [...emails],
        });
      }
    }
  };

  useEffect(() => {
    const emails = store.get('emails');
    setEmailTemplates(emails?.value || data?.emailTemplates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, data?.emailTemplates]);

  useEffect(() => {
    const invite = store.get('invite');

    setInviteValues(invite?.value || data?.inviteTemplates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, data?.inviteTemplates]);

  const addEmailTemplate = () => {
    onAddEmailTemplate(emailTemplates);
  };

  const removeEmailTemplate = emailId => {
    onRemoveEmailTemplate(emailTemplates, emailId);
  };

  return (
    <div id="meetingMgmt" className={cx(style.meetingMgmt)}>
      <div className="row">
        <div className="col-2">
          <div className={style.dynamicFields}>
            <h3>dynamic fields</h3>
            <div className={style.fields}>
              {dynamicFields.map(df => (
                <DynamicField
                  key={`dynamic-field-${df.field}`}
                  field={df.field}
                  value={df.value}
                  sample={df.sample}
                />
              ))}
              {dynamicFields.length === 0 && (
                <Link to="/organization/app">
                  Create dyanmic fields?
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="col-10">
          <div className="row">
            <div className="col-6">
              <Suspense fallback={<span />}>
                <InviteTemplate
                  onEditorChange={handleInviteEditorChange}
                  values={inviteValues}
                  onChange={handleInviteFieldsChange}
                />
              </Suspense>
            </div>
            <div className="col-6">
              <Suspense fallback={<span />}>
                {emailTemplates &&
                  emailTemplates.map((email, index) => {
                    const order = index + 1;

                    return (
                      <EmailTemplate
                        onTemplateDelete={removeEmailTemplate}
                        canDelete={order > 1}
                        key={`email-template-${order}`}
                        values={email}
                        order={order}
                        onChange={row =>
                          handleEmailFieldsChange(row, order)
                        }
                        onEditorChange={(body, delta, source) =>
                          onEmailBodyChange(body, order, source)
                        }
                      />
                    );
                  })}
              </Suspense>

              <div className={style.templateActions}>
                <div className="row">
                  <div className="col-6 col-offset-5">
                    <Button
                      type="tertiary"
                      onClick={addEmailTemplate}
                    >
                      <Icon
                        path={mdiPlus}
                        size={2}
                        className={style.close}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Definition.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  dynamicFields: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  onAddEmailTemplate: PropTypes.func,
  onRemoveEmailTemplate: PropTypes.func,
};

Definition.defaultProps = {
  data: null,
  dynamicFields: [],
  onAddEmailTemplate: () => {},
  onRemoveEmailTemplate: () => {},
};

export { Definition as default };

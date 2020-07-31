/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { mdiEmailOutline, mdiTrashCanOutline } from '@mdi/js';
import style from './style.module.scss';
import TextEditor from '../../../components/textEditor/TextEditorBeta';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';

const EmailTemplate = ({
  canDelete,
  onTemplateDelete,
  onFocus,
  onChange,
  onEditorChange,
  values,
  order,
}) => {
  const handleFocus = useCallback(
    event => {
      const {
        target: { name },
      } = event;

      onFocus({ name, order });
    },
    [onFocus, order],
  );

  return (
    <div className={style.emailTemplate}>
      <Card
        contentClassName={[style.content]}
        className={[style.emailTemplateContent]}
        type="dark"
      >
        <form>
          <div className={style.header}>
            {canDelete && (
              <Button
                type="tertiary"
                icon={mdiTrashCanOutline}
                onClick={() => onTemplateDelete(values.id)}
              />
            )}
            <span className={style.order}>{order}</span>
          </div>
          <label>
            <span>Email Subject</span>
            <input
              type="text"
              name="title"
              placeholder="Subject"
              value={values.title || ''}
              onChange={onChange}
              onFocus={handleFocus}
            />
          </label>
        </form>
        <TextEditor
          value={values.body || ''}
          height={250}
          onChange={onEditorChange}
        />
      </Card>
    </div>
  );
};

EmailTemplate.propTypes = {
  canDelete: PropTypes.bool,
  onChange: PropTypes.func,
  onEditorChange: PropTypes.func,
  onFocus: PropTypes.func,
  onTemplateDelete: PropTypes.func,
  order: PropTypes.number,
  values: PropTypes.shape({
    body: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
  }),
};

EmailTemplate.defaultProps = {
  canDelete: false,
  onChange: () => {},
  onEditorChange: () => {},
  onFocus: () => {},
  onTemplateDelete: () => {},
  order: 1,
  values: {
    body: '',
    id: 0,
    title: '',
  },
};

export { EmailTemplate as default };

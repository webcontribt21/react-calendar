/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';
import TextEditor from '../../../components/textEditor/TextEditorBeta';
import Card from '../../../components/card/Card';

const InviteTemplate = ({ onChange, onEditorChange, values }) => {
  return (
    <div className={style.inviteTemplate}>
      <Card
        contentClassName={[style.content, style.invite]}
        type="dark"
      >
        <form>
          <label>
            <span>Invite title</span>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={values.title || ''}
              onChange={onChange}
            />
          </label>
          <label>
            <span>Location</span>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={values.location || ''}
              onChange={onChange}
            />
          </label>
        </form>
        <textarea
          className={style.areaEditor}
          onChange={onEditorChange}
          value={values.notes || ''}
        />
      </Card>
    </div>
  );
};

InviteTemplate.propTypes = {
  onChange: PropTypes.func,
  onEditorChange: PropTypes.func,
  values: PropTypes.shape({
    location: PropTypes.string,
    notes: PropTypes.string,
    title: PropTypes.string,
  }),
};

InviteTemplate.defaultProps = {
  onChange: () => {},
  onEditorChange: () => {},
  values: {
    location: '',
    notes: '',
    title: '',
  },
};

export { InviteTemplate as default };

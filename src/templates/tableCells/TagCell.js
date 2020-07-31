import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import style from './style.module.scss';
import Tag from '../../components/tag/Tag';

const types = {
  EMAIL: 'email',
  INVITE: 'invite',
};

const typesClass = {
  [types.EMAIL]: 'info',
  [types.INVITE]: 'default',
};

const TagCell = ({ row }) => {
  const {
    cell: { value },
  } = row;

  if (value) {
    return (
      <div className={cx(style.multiCell, style.tagCell)}>
        <div key={`tag-value-${value}`} className={style.subItem}>
          <Tag type={typesClass[value]}>{value}</Tag>
        </div>
      </div>
    );
  }

  return null;
};

TagCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { TagCell as default };

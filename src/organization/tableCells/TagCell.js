import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import style from './style.module.scss';
import Tag from '../../components/tag/Tag';

const TagCell = ({ row }) => {
  const {
    cell: { value },
  } = row;

  if (value) {
    return (
      <div className={style.multiCell}>
        {value.map(v => {
          return (
            <div
              key={`tag-value-${shortid.generate()}`}
              className={style.subItem}
            >
              <Tag>{v.name}</Tag>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

TagCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { TagCell as default };

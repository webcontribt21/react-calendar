import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { mdiClose } from '@mdi/js';
import style from './style.module.scss';
import Tag from '../../components/tag/Tag';
import Button from '../../components/button/Button';

const TagCell = ({ row, canDelete, onDelete }) => {
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
              <Tag>
                <span className={style.remove}>
                  {canDelete && (
                    <Button
                      className={[style.removeBtn]}
                      type="tertiary"
                      icon={mdiClose}
                      onClick={() => onDelete(v)}
                    />
                  )}
                </span>
                <span>{v.name}</span>
              </Tag>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

TagCell.propTypes = {
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

TagCell.defaultProps = {
  canDelete: false,
  onDelete: () => {},
};

export { TagCell as default };

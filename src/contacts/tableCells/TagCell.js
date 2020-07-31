import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { mdiClose } from '@mdi/js';
import style from './style.module.scss';
import Tag from '../../components/tag/Tag';
import Button from '../../components/button/Button';

const TagCell = ({ mappings, row, canDelete, onDelete }) => {
  const {
    cell: { value },
    column: { id: columnName },
  } = row;

  if (value) {
    return (
      <div className={style.multiCell}>
        {value.map(v => {
          return (
            v[columnName] && (
              <div
                key={`tag-value-${shortid.generate()}`}
                className={style.subItem}
              >
                {mappings !== null ? (
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
                    <span>{mappings[v[columnName]]}</span>
                  </Tag>
                ) : (
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
                    <span>{v[columnName]}</span>
                  </Tag>
                )}
              </div>
            )
          );
        })}
      </div>
    );
  }

  return null;
};

TagCell.propTypes = {
  canDelete: PropTypes.bool,
  mappings: PropTypes.objectOf(PropTypes.any),
  onDelete: PropTypes.func,
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

TagCell.defaultProps = {
  canDelete: false,
  mappings: null,
  onDelete: () => {},
};

export { TagCell as default };

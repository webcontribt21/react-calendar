import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { mdiCheckboxBlank, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import style from './table.module.scss';
import Button from '../button/Button';
import useDebounce from '../../hooks/useDebounce';

const TableActions = ({
  count,
  customControls,
  onSearch,
  showCount,
  showDeleteAll,
  isSearching,
}) => {
  const [qry, setQry] = useState(null);
  const debouncedQry = useDebounce(qry);

  const handleChange = useCallback(event => {
    const {
      currentTarget: { value },
    } = event;

    setQry(value);
  }, []);

  useEffect(() => {
    if (debouncedQry !== null) {
      onSearch(debouncedQry);
    }
  }, [onSearch, debouncedQry]);

  const handleSearchSubmit = e => e.preventDefault();

  return (
    <div className={style.tableActions}>
      {showDeleteAll && (
        <Button type="secondary">
          <Icon path={mdiCheckboxBlank} size={1} />
        </Button>
      )}
      {customControls}
      {showCount && <h3>{`${count} total contacts`}</h3>}

      <div className={style.dataOps}>
        <form onSubmit={handleSearchSubmit} className={style.filters}>
          <label htmlFor="qrySearch">
            <div className="input-icon">
              <input
                name="qrySearch"
                type="text"
                className="fluid"
                placeholder="Search..."
                onChange={handleChange}
              />
              <Icon
                path={mdiMagnify}
                size={1}
                className={cx({ [style.searching]: isSearching })}
              />
            </div>
          </label>
        </form>
      </div>
    </div>
  );
};

TableActions.propTypes = {
  count: PropTypes.number,
  customControls: PropTypes.arrayOf(PropTypes.element),
  isSearching: PropTypes.bool,
  onSearch: PropTypes.func,
  showCount: PropTypes.bool,
  showDeleteAll: PropTypes.bool,
};

TableActions.defaultProps = {
  count: 0,
  customControls: null,
  isSearching: false,
  onSearch: () => {},
  showCount: false,
  showDeleteAll: false,
};

export { TableActions as default };

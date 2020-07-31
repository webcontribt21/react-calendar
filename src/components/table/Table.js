import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import {
  useExpanded,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  useTableState,
} from 'react-table';
import {
  mdiPageFirst,
  mdiChevronDown,
  mdiChevronLeft,
  mdiPencil,
  mdiCheck,
  mdiClose,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import style from './table.module.scss';
import Dropdown from '../dropdown/Dropdown';
import Button from '../button/Button';
import Checkbox from '../checkbox/Checkbox';
import TableActions from './TableActions';
import pagination from '../../utils/table';
import { LoadingTable } from '../genericView/GenericView';

const getSortingIcon = isDesc => (
  <Icon path={mdiChevronDown} size={1} rotate={isDesc ? 180 : 0} />
);

const IconHeader = ({ getToggleAllRowsSelectedProps }, icon) => (
  <div {...getToggleAllRowsSelectedProps()}>
    <Icon path={icon} size={1} />
  </div>
);

IconHeader.propTypes = {
  getToggleAllRowsSelectedProps: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

const CheckboxHeader = ({ getToggleAllRowsSelectedProps }) => (
  <div className={style.centered}>
    <Checkbox {...getToggleAllRowsSelectedProps()} />
  </div>
);

CheckboxHeader.propTypes = {
  getToggleAllRowsSelectedProps: PropTypes.func.isRequired,
};

const CheckboxCell = ({ row, ...rest }) => (
  <div className={style.centered}>
    <Checkbox {...row.getToggleRowSelectedProps()} />
  </div>
);

CheckboxCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

const ExpanderCell = ({ row, ...rest }) => {
  return (
    <div {...row.getExpandedToggleProps()}>
      <div className={style.expander}>
        {getSortingIcon(row.isExpanded)}
        {rest.cell.value}
      </div>
    </div>
  );
};

ExpanderCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
};

const EditingCell = ({ row, updateFunc }) => {
  const [editMode, setEditMode] = useState(false);
  const [cellValue, setCellValue] = useState(null);
  const [oldVal, setOldVal] = useState(row.cell.value);

  const inputRef = useRef(null);
  const name = `row-edit-cell-${shortid.generate()}`;

  useEffect(() => {
    if (editMode) {
      inputRef.current.focus();
    }
  }, [editMode]);

  const toggleEditMode = event => {
    if (event) {
      event.stopPropagation();
    }
    setEditMode(!editMode);
  };

  const update = () => {
    if (cellValue && cellValue !== '') {
      updateFunc({
        column: row.column.id,
        id: row.row.original.id,
        value: cellValue,
      });
      setOldVal(cellValue);
    }
    toggleEditMode();
  };

  const onValueChange = event => {
    const {
      currentTarget: { value },
    } = event;

    setCellValue(value);
  };

  const onCancel = () => {
    setCellValue(oldVal);
    toggleEditMode();
  };

  const onEnter = event => {
    if (event.key === 'Enter') {
      if (cellValue && cellValue !== '') {
        updateFunc({
          column: row.column.id,
          id: row.row.original.id,
          value: cellValue,
        });
      }

      toggleEditMode();
    } else if (event.keyCode === 27) {
      onCancel();
    } else {
      onValueChange(event);
    }
  };

  if (editMode) {
    return (
      <div className={style.editWrapper}>
        <label htmlFor={name}>
          <input
            ref={inputRef}
            name={name}
            type="text"
            value={cellValue || row.cell.value}
            onChange={onValueChange}
            onKeyDown={onEnter}
          />
        </label>
        <div className={style.editActions}>
          <Button icon={mdiCheck} type="text" onClick={update} />
          <Button icon={mdiClose} type="text" onClick={onCancel} />
        </div>
      </div>
    );
  }
  return (
    <div className={style.editWrapper}>
      <Button
        type="text"
        onClick={toggleEditMode}
        className={[style.editMode]}
      >
        {cellValue || row.cell.value}
      </Button>
      <Button icon={mdiPencil} type="text" onClick={update} />
    </div>
  );
};

EditingCell.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
  updateFunc: PropTypes.func,
};

EditingCell.defaultProps = {
  updateFunc: () => {},
};

const EditingJSONCell = ({ row, prop, updateFunc }) => {
  const [editMode, setEditMode] = useState(false);
  const [cellValue, setCellValue] = useState(null);

  const inputRef = useRef(null);
  const name = `row-edit-cell-${shortid.generate()}`;

  useEffect(() => {
    if (editMode) {
      inputRef.current.focus();
    }
  }, [editMode]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const onBlur = () => {
    if (cellValue && cellValue !== '') {
      updateFunc({
        column: row.column.id,
        id: row.row.original.id,
        prop,
        value: {
          ...row.cell.value,
          [prop]: cellValue,
        },
      });
    }
    toggleEditMode();
  };

  const onValueChange = event => {
    const {
      currentTarget: { value },
    } = event;

    setCellValue(value);
  };

  if (editMode) {
    return (
      <div className={style.editWrapper}>
        <label htmlFor={name}>
          <input
            ref={inputRef}
            name={name}
            type="text"
            value={cellValue || row.cell.value[prop]}
            onChange={onValueChange}
            onBlur={onBlur}
          />
        </label>
      </div>
    );
  }
  return (
    <div className={style.editWrapper}>
      <Button
        type="text"
        onClick={toggleEditMode}
        className={[style.editMode]}
      >
        {cellValue || row.cell.value[prop]}
      </Button>
    </div>
  );
};

EditingJSONCell.propTypes = {
  prop: PropTypes.string.isRequired,
  row: PropTypes.objectOf(PropTypes.any).isRequired,
  updateFunc: PropTypes.func,
};

EditingJSONCell.defaultProps = {
  updateFunc: () => {},
};

const Table = ({
  rowID,
  columns,
  controls,
  data,
  fetchData,
  initialSort,
  initialPageSize,
  onSelect,
  pageCount: controlledPageCount,
  properties,
  subComponent,
  total,
  noData,
}) => {
  const [loading, isLoading] = useState(true);
  const [qry, setQry] = useState(null);
  const tableState = useTableState({
    pageIndex: 0,
    pageSize: initialPageSize,
    ...(initialSort
      ? {
          sortBy: initialSort,
        }
      : {}),
  });
  const [
    { pageIndex: offset, pageSize: limit, selectedRows, sortBy },
  ] = tableState;

  const {
    columns: flatColumns,
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      getRowID: row => row.id || row[rowID],
      manualPagination: true,
      manualSorting: true,
      pageCount: controlledPageCount,
      state: tableState,
    },
    useExpanded,
    useSortBy,
    useRowSelect,
    usePagination,
  );

  useEffect(() => {
    const fetch = async () => {
      isLoading(true);
      await fetchData(limit, offset, sortBy, qry);
      isLoading(false);
    };
    fetch();
  }, [fetchData, limit, offset, qry, sortBy]);

  useEffect(() => {
    onSelect(selectedRows);
  }, [onSelect, selectedRows]);

  const handleTableNav = useCallback(
    event => {
      if (event.keyCode === 37) {
        // Left
        if (canPreviousPage) {
          previousPage();
        }
      } else if (event.keyCode === 39) {
        // Right
        if (canNextPage) {
          nextPage();
        }
      }
    },
    [canNextPage, canPreviousPage, nextPage, previousPage],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleTableNav, false);
    return () => {
      window.removeEventListener('keydown', handleTableNav, false);
    };
  }, [handleTableNav]);

  const renderRowSubComponent = useCallback(
    ({ row }) => (subComponent ? subComponent(row) : () => null),
    [subComponent],
  );

  return (
    <>
      <TableActions
        count={total}
        showCount={properties.showCount}
        showDeleteAll={properties.canDeleteAll}
        customControls={controls}
        onSearch={setQry}
        isSearching={loading}
      />

      {!data.length && loading && <LoadingTable />}
      {!data.length && !loading && noData}
      {data.length > 0 && (
        <>
          <table
            {...getTableProps()}
            className={cx(style.table, {
              [style.isFluid]: properties.fluid,
            })}
          >
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => {
                    return (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps(),
                        )}
                      >
                        <span className={style.header}>
                          {column.render('Header')}
                          {column.isSorted &&
                            getSortingIcon(column.isSortedDesc)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {page.map((row, i) => {
                return (
                  prepareRow(row) || (
                    <React.Fragment
                      key={`row-data-id-${
                        row.original[rowID]
                          ? row.original[rowID]
                          : row.original.id
                      }`}
                    >
                      <tr
                        {...row.getRowProps()}
                        className={cx({
                          [style.currentExpanded]: row.isExpanded,
                          [style.selected]: row.isSelected,
                        })}
                      >
                        {row.cells.map(cell => {
                          return (
                            <td {...cell.getCellProps()}>
                              {cell.render('Cell')}
                            </td>
                          );
                        })}
                      </tr>
                      {row.isExpanded && (
                        <tr className={style.expanded}>
                          <td colSpan={flatColumns.length}>
                            {renderRowSubComponent({ row })}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                );
              })}
            </tbody>
          </table>
          <div className={style.pagination}>
            <div className={style.controls}>
              <Button
                type="secondary"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <Icon path={mdiPageFirst} size={1} />
              </Button>
              <Button
                type="secondary"
                onClick={previousPage}
                disabled={!canPreviousPage}
              >
                <Icon path={mdiChevronLeft} size={1} />
              </Button>
              <div className={style.pages}>
                {pagination(offset + 1, pageOptions.length).map(i => {
                  if (i !== '...') {
                    return (
                      <Button
                        key={`page-${i}`}
                        type="tertiary"
                        onClick={() => gotoPage(i - 1)}
                        active={offset === i - 1}
                      >
                        {i}
                      </Button>
                    );
                  }

                  return (
                    <span
                      className={style.elipsis}
                      key={`page-${i}-${shortid.generate()}`}
                    >
                      {i}
                    </span>
                  );
                })}
              </div>
              <Button
                type="secondary"
                onClick={nextPage}
                disabled={!canNextPage}
              >
                <Icon path={mdiChevronLeft} rotate={180} size={1} />
              </Button>
              <Button
                type="secondary"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                <Icon path={mdiPageFirst} rotate={180} size={1} />
              </Button>
            </div>
            {properties.showPageSize && (
              <Dropdown
                labelProp="value"
                valueProp="value"
                onSelect={item => setPageSize(item.value)}
                data={[
                  { value: 10 },
                  { value: 25 },
                  { value: 50 },
                  { value: 100 },
                ]}
                selectItem={initialPageSize}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  controls: PropTypes.arrayOf(PropTypes.element),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchData: PropTypes.func.isRequired,
  initialPageSize: PropTypes.number,
  initialSort: PropTypes.arrayOf(
    PropTypes.shape({
      desc: PropTypes.bool,
      id: PropTypes.string,
    }),
  ),
  noData: PropTypes.element,
  onSelect: PropTypes.func,
  pageCount: PropTypes.number.isRequired,
  properties: PropTypes.shape({
    canDeleteAll: PropTypes.bool,
    fluid: PropTypes.bool,
    showCount: PropTypes.bool,
    showPageSize: PropTypes.bool,
  }),
  rowID: PropTypes.string,
  subComponent: PropTypes.func,
  total: PropTypes.number,
};

Table.defaultProps = {
  controls: null,
  initialPageSize: 10,
  initialSort: null,
  noData: null,
  onSelect: () => {},
  properties: {
    canDeleteAll: false,
    fluid: false,
    showCount: true,
    showPageSize: true,
  },
  rowID: null,
  subComponent: null,
  total: 0,
};

export {
  Table as default,
  CheckboxCell,
  CheckboxHeader,
  EditingCell,
  EditingJSONCell,
  ExpanderCell,
  IconHeader,
};

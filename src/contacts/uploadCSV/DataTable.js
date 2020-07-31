import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import shortid from 'shortid';
import style from './style.module.scss';
import Dropdown from '../../components/dropdown/Dropdown';

ReactModal.setAppElement('#kronologic-ai-app');

const DataTable = ({ onChange, fieldCount, headers, sampleRow }) => {
  const [hrs, setHrs] = useState(Array(fieldCount).fill(headers[0]));

  const onHeaderSelect = useCallback(
    (item, index) => {
      const newHrs = [...hrs];
      newHrs[index] = item;

      setHrs(newHrs);
      onChange(newHrs);
    },
    [hrs, onChange],
  );

  return (
    <table>
      <thead>
        <tr>
          <th>header</th>
          <th>sample row</th>
        </tr>
      </thead>
      <tbody>
        {sampleRow &&
          sampleRow.length &&
          hrs.map((hr, i) => {
            return (
              <tr
                key={`tr-hrow-${shortid.generate()}`}
                className={cx({
                  [style.disabled]: false,
                })}
              >
                <td>
                  <Dropdown
                    labelProp="name"
                    valueProp="value"
                    data={headers}
                    selectItem={hr}
                    onSelect={item => onHeaderSelect(item, i)}
                  />
                </td>
                <td>{sampleRow[i]}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

DataTable.propTypes = {
  fieldCount: PropTypes.number.isRequired,
  headers: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  sampleRow: PropTypes.arrayOf(PropTypes.any).isRequired,
};

DataTable.defaultProps = {
  onChange: () => {},
};

export { DataTable as default };

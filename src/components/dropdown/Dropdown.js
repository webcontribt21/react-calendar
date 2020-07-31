/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import style from './dropdown.module.scss';

const Dropdown = ({
  data,
  onSelect,
  selectItem,
  valueProp,
  labelProp,
  label,
}) => {
  const [selected, setSelected] = useState(selectItem);

  useEffect(() => {
    setSelected(selectItem);
    return () => {
      setSelected(null);
    };
  }, [selectItem]);

  const onChange = event => {
    const {
      currentTarget: { selectedIndex },
    } = event;

    const index = label ? selectedIndex - 1 : selectedIndex;

    if (label && index < 0) {
      setSelected('');
    } else {
      setSelected(data[index]);
    }

    onSelect(data[index]);
  };

  return (
    <select
      onChange={onChange}
      value={(selected !== '' && selected[valueProp]) || selected}
      className={style.dropdown}
    >
      {label && <option value="">{label}</option>}
      {data.map(option => {
        return (
          <option
            disabled={option.disabled}
            key={`option-${option[labelProp]}`}
            value={option[valueProp]}
          >
            {option[labelProp]}
          </option>
        );
      })}
    </select>
  );
};

Dropdown.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  label: PropTypes.string,
  labelProp: PropTypes.string,
  onSelect: PropTypes.func,
  selectItem: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.any),
    PropTypes.number,
    PropTypes.string,
  ]),
  valueProp: PropTypes.string,
};

Dropdown.defaultProps = {
  label: null,
  labelProp: 'id',
  onSelect: () => {},
  selectItem: '',
  valueProp: 'value',
};

export default Dropdown;

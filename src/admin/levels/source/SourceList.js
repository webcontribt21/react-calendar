import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../../components/card/Card';
import style from './source.module.scss';
import SourceListItem from './SourceListItem';

/**
 * @function
 * SourceList
 * @description
 * Renders Card component with list of Source components.
 *
 * @private
 *
 * @param {string} selected Source's selected source.
 * @param {func} onChange Source's onClick event handler.
 *
 * @returns {HTMLElement} React element representing source.
 */
const SourceList = ({ data, selected, onChange }) => {
  return (
    <Card className={style.availableSources}>
      <ul>
        {data.map(source => (
          <SourceListItem
            key={`source-${source}`}
            name={source}
            selected={source === selected}
            onClick={onChange}
          />
        ))}
      </ul>
    </Card>
  );
};

SourceList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  selected: PropTypes.string,
};

SourceList.defaultProps = {
  data: [],
  onChange: () => {},
  selected: null,
};

export default SourceList;

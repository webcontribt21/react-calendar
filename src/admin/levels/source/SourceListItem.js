/* eslint-disable import/no-unresolved */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import hubspotImg from 'assets/hubspot.png';
import salesforceImg from 'assets/salesforce';
import zapierImg from 'assets/zapier.png';
import csvImg from 'assets/csv.png';
import style from './source.module';
import { sources } from '../../props';

const imageMapping = {
  [sources.CSV]: csvImg,
  [sources.HUBSPOT]: hubspotImg,
  [sources.SALESFORCE]: salesforceImg,
  [sources.ZAPIER]: zapierImg,
};

/**
 * @function
 * SourceListItem
 * @description
 * SourceListItem component
 *
 * @private
 *
 * @param {string} name Source's name.
 * @param {boolean} selected Source's selected flag.
 * @param {func} onClick Source's onClick event handler.
 *
 * @returns {HTMLElement} React element representing source.
 */
const SourceListItem = ({ name, selected, onClick }) => {
  return (
    <li className={selected ? style.isSelected : ''}>
      <button
        onClick={() => onClick(name)}
        type="button"
        className={cx('btn is-ghost', {
          'is-selected': selected,
        })}
      >
        <img src={imageMapping[name]} alt={name} />
        <span>{name}</span>
      </button>
    </li>
  );
};

SourceListItem.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};

SourceListItem.defaultProps = {
  onClick: () => {},
  selected: false,
};

export default SourceListItem;

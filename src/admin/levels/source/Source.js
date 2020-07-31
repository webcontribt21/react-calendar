/* eslint-disable import/no-unresolved */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import hubspotImg from 'assets/hubspot.png';
import salesforceImg from 'assets/salesforce';
import zapierImg from 'assets/zapier.png';
import csvImg from 'assets/csv.png';
import Card from '../../../components/card/Card';
import { sources } from '../../props';
import style from './source.module.scss';

const imageMapping = {
  [sources.CSV]: csvImg,
  [sources.HUBSPOT]: hubspotImg,
  [sources.SALESFORCE]: salesforceImg,
  [sources.ZAPIER]: zapierImg,
};

const Source = ({ children, selected }) => {
  const Header = () => (
    <div className={style.sourceHeader}>
      <img src={imageMapping[selected]} alt={selected} />
    </div>
  );

  return <Card header={<Header />}>{children}</Card>;
};

Source.propTypes = {
  children: PropTypes.element,
  selected: PropTypes.string,
};

Source.defaultProps = {
  children: null,
  selected: sources.CSV,
};

export default Source;

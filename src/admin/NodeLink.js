/* eslint-disable import/no-unresolved */
import { interpolateNumber, sankeyLinkHorizontal } from 'd3-sankey';
import PropTypes from 'prop-types';
import React from 'react';
import style from './admin.module';

const NodeLink = ({ link }) => {
  return (
    <path
      d={sankeyLinkHorizontal()(link)}
      style={{
        opacity: link.highlight ? 0.7 : 0.3,
        strokeWidth: Math.max(1, link.width),
        // strokeWidth: 50,
      }}
      className={style.path}
    />
  );
};

NodeLink.propTypes = {
  link: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { NodeLink as default };

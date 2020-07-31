import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import style from './tag.module.scss';

const Tag = ({ children, className, type, hasSwitch, ...rest }) => {
  return (
    <span
      className={cx(style.tag, style[type], {
        [style.withSwitch]: hasSwitch,
        className,
      })}
      {...rest}
    >
      {children}
    </span>
  );
};

Tag.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  hasSwitch: PropTypes.bool,
  type: PropTypes.oneOf([
    'default',
    'warning',
    'error',
    'info',
    'light',
  ]),
  value: PropTypes.string,
};

Tag.defaultProps = {
  children: null,
  className: [],
  hasSwitch: false,
  type: 'default',
  value: null,
};

export default Tag;

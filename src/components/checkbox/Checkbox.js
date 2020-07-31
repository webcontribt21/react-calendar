import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import style from './checkbox.module.scss';

const Checkbox = ({ className, ...rest }) => {
  return (
    <div className={cx(style.chkContainer, className)}>
      <input type="checkbox" {...rest} />
      <span className={style.checkmark} />
    </div>
  );
};

Checkbox.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

Checkbox.defaultProps = {
  className: [],
};

export default Checkbox;

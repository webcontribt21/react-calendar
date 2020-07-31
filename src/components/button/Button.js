/* eslint-disable jsx-a11y/label-has-for */
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import cx from 'classnames';
import Icon from '@mdi/react';
import style from './button.module.scss';

const ButtonGroup = ({ children }) => (
  <div className={style.group}>{children}</div>
);

ButtonGroup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.any])
    .isRequired,
};

const Button = ({
  active,
  className,
  disabled,
  icon,
  pulse,
  size,
  type,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        style.btn,
        { [style.pulseSuccess]: pulse },
        style[type],
        { [style.disabled]: disabled },
        { [style.isActive]: active },
        className,
      )}
      data-size={size}
      {...rest}
    >
      {icon && (
        <>
          <Icon path={icon} size={1} className={style.icon} />
          {children}
        </>
      )}
      {!icon && children}
    </button>
  );
};

Button.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.any,
  ]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  pulse: PropTypes.bool,
  size: PropTypes.oneOf(['default', 'small', 'large']),
  type: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'text']),
};

Button.defaultProps = {
  active: false,
  children: null,
  className: [],
  disabled: false,
  icon: null,
  pulse: false,
  size: 'default',
  type: 'primary',
};

export { Button as default, ButtonGroup };

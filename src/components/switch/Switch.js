/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { mdiCheck, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import shortid from 'shortid';
import style from './switch.module.scss';

const Switch = ({
  isOn,
  handleToggle,
  icon,
  useIcon,
  size,
  children,
  ...rest
}) => {
  const id = shortid.generate();

  const iconSize = {
    default: 0.7,
    large: 1,
    small: 0.5,
  };

  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={style.switchChk}
        id={`chk-switch-${id}`}
        type="checkbox"
        {...rest}
      />
      <label
        data-size={size}
        className={cx(style.switchLbl, { [style.isOn]: isOn })}
        htmlFor={`chk-switch-${id}`}
      >
        <span className={style.switchBtn}>
          {useIcon ? (
            <Icon
              path={isOn ? mdiCheck : mdiClose}
              size={iconSize[size]}
            />
          ) : (
            children
          )}
        </span>
      </label>
    </>
  );
};

Switch.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  handleToggle: PropTypes.func,
  icon: PropTypes.string,
  isOn: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  useIcon: PropTypes.bool,
};

Switch.defaultProps = {
  children: null,
  handleToggle: () => {},
  icon: null,
  isOn: false,
  size: 'default',
  useIcon: true,
};

export default Switch;

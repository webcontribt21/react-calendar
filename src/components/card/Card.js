import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '@mdi/react';
import style from './card.module.scss';

const Card = ({
  active,
  className,
  contentClassName,
  header,
  children,
  icon,
  type,
  ...rest
}) => (
  <section
    className={cx(
      style.card,
      { [style.active]: active, [style.dark]: type === 'dark' },
      className,
    )}
    {...rest}
  >
    {header && (
      <header>
        {icon && (
          <div className={style.icon}>
            <Icon path={icon} size={1} />
          </div>
        )}
        {header}
      </header>
    )}
    {children && (
      <div className={cx(style.content, contentClassName)}>
        {children}
      </div>
    )}
  </section>
);

Card.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.any,
  ]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  contentClassName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.string,
  type: PropTypes.string,
};

Card.defaultProps = {
  active: false,
  children: null,
  className: '',
  contentClassName: '',
  header: null,
  icon: null,
  type: null,
};

export default Card;

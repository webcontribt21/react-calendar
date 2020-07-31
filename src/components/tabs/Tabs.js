import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import cx from 'classnames';
import Icon from '@mdi/react';
import style from './tabs.module.scss';
import Button from '../button/Button';

const Tab = ({ index, className, title, icon, active, onClick }) => {
  const onTabSelection = useCallback(() => {
    onClick(index);
  }, [index, onClick]);

  return (
    <Button
      onClick={onTabSelection}
      type="tertiary"
      className={cx(style.tab, { [style.active]: active }, className)}
    >
      <h3>
        {icon && <Icon className={style.icon} path={icon} size={1} />}
        <span>{title}</span>
      </h3>
    </Button>
  );
};

Tab.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  icon: PropTypes.string,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
};

Tab.defaultProps = {
  active: false,
  className: [],
  icon: null,
  index: 0,
  onClick: () => {},
};

const Tabs = ({ className, children }) => (
  <section className={cx(style.tabs, className)}>{children}</section>
);

Tabs.propTypes = {
  children: PropTypes.oneOfType([PropTypes.any]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

Tabs.defaultProps = {
  children: null,
  className: [],
};

export { Tabs, Tab };

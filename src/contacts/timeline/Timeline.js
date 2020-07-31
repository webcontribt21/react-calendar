import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import useComponentSize from '@rehooks/component-size';
import cx from 'classnames';
import style from './timeline.module.scss';

const FluxItem = ({ id, labels }) => {
  if (labels && typeof labels !== 'string') {
    return labels.map(lbl => (
      <div
        key={`flux-item-${id}-${lbl.label}`}
        className={style.fluxItem}
      >
        <span className={cx('tag is-fire', [style.tag])}>
          {lbl.label}
        </span>
        <p className={style.tagValue}>{lbl.value}</p>
      </div>
    ));
  }

  if (labels && typeof labels === 'string') {
    return (
      <div key={`flux-item-${id}`} className={style.fluxItem}>
        <p className={style.tagValue}>{labels}</p>
      </div>
    );
  }

  return null;
};

FluxItem.propTypes = {
  id: PropTypes.number,
  labels: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.string,
    null,
  ]),
};

FluxItem.defaultProps = {
  id: 0,
  labels: null,
};

const Flux = ({ header, status, children, ...rest }) => {
  return (
    <div className={style.flux} {...rest}>
      <section className={style.bodyWrapper}>
        {header && (
          <header>
            <h3>{header}</h3>
            <span className="tag is-secondary">{status}</span>
          </header>
        )}
        <div className={style.body}>{children}</div>
      </section>
    </div>
  );
};

Flux.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
    .isRequired,
  header: PropTypes.string,
  status: PropTypes.string,
};

Flux.defaultProps = {
  header: null,
  status: null,
};

const Group = ({ children, tag }) => {
  return (
    <div className={style.fluxGroup}>
      <span className={style.tag}>{tag}</span>
      {children}
    </div>
  );
};

Group.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
    .isRequired,
  tag: PropTypes.string.isRequired,
};

const TimeLine = ({ children }) => {
  const ref = useRef(null);
  const { height } = useComponentSize(ref);

  return (
    <section className={style.timeline}>
      <div className={style.pole} style={{ height }} />
      <div ref={ref} className={style.fluxes}>
        {children}
      </div>
    </section>
  );
};

TimeLine.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.instanceOf(Flux)),
    PropTypes.instanceOf(Flux),
  ]).isRequired,
};

export { Flux, FluxItem, Group, TimeLine };

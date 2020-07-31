import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@mdi/react';
import style from './style.module.scss';

const EmptyView = ({ view, icon, actions }) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className={style.emptyView}>
          <Icon path={icon} size={10} />
          <div>
            <span className={style.viewName}>{view}</span>
            <span>has no data available.</span>
          </div>
          <div className={style.actions}>{actions}</div>
        </div>
      </div>
    </div>
  );
};

EmptyView.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  icon: PropTypes.string,
  view: PropTypes.string,
};

EmptyView.defaultProps = {
  actions: null,
  icon: '',
  view: '',
};

const LoadingTable = () => {
  return (
    <div className="container is--fluid">
      <div className="row">
        <div className="col-12">
          <div className={style.skeleton} />
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className={style.skeleton} />
        </div>
        <div className="col-4">
          <div className={style.skeleton} />
        </div>
        <div className="col-4">
          <div className={style.skeleton} />
        </div>
      </div>
    </div>
  );
};

const LoadingCard = () => {
  return (
    <div className="container is--fluid">
      <div className="row">
        <div className="col-12">
          <div
            className={style.skeleton}
            style={{ height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

const NoView = () => <div />;

export { EmptyView, LoadingCard, LoadingTable, NoView };

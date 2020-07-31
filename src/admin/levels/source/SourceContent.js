import React, { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import style from './source.module.scss';
import { sources } from '../../props';
import SourceList from './SourceList';
import Source from './Source';

const SourceContent = ({ close }) => {
  const componentMapping = {
    [sources.CSV]: lazy(() => import('./csv/CSVSource')),
    [sources.HUBSPOT]: lazy(() => import('./csv/CSVSource')),
    [sources.SALESFORCE]: lazy(() => import('./csv/CSVSource')),
    [sources.ZAPIER]: lazy(() => import('./csv/CSVSource')),
  };

  const [currentSource, setCurrentSource] = useState(sources.CSV);
  const [Component, setComponent] = useState(
    componentMapping[sources.CSV],
  );

  useEffect(() => {
    if (currentSource) {
      setComponent(componentMapping[currentSource]);
    }
  }, [componentMapping, currentSource]);

  return (
    <section className={cx('container is--fluid', style.source)}>
      <div className="row">
        <div className="col-1 col-offset-10">
          <Icon
            path={mdiClose}
            size={2}
            className={style.close}
            onClick={close}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-3 col-offset-2">
          <SourceList
            data={Object.values(sources)}
            selected={currentSource}
            onChange={setCurrentSource}
          />
        </div>
        <div className="col-5">
          <Source selected={currentSource}>
            <Suspense fallback={<div>...loading</div>}>
              <Component />
            </Suspense>
          </Source>
        </div>
      </div>
    </section>
  );
};

SourceContent.propTypes = {
  close: PropTypes.func,
};

SourceContent.defaultProps = {
  close: () => {},
};

export { SourceContent as default };

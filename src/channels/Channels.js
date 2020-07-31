/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Route, Switch, useHistory } from 'react-router-dom';
import API from '../props';
import style from './style.module.scss';
import { get } from '../utils/fetch';
import { AuthContext } from '../auth/AuthContextService';
import { Tabs, Tab } from '../components/tabs/Tabs';
import TotalCount from './cards/TotalCount';

const Import = lazy(() => import('./import/Import'));
const Intercept = lazy(() => import('./intercept/Intercept'));
const Update = lazy(() => import('./update/Update'));

const ROUTES = {
  IMPORT: '/channels/import',
  INTERCEPT: '/channels/intercept',
  UPDATE: '/channels/update',
};

const Channels = ({ match }) => {
  const [selectedTab, setTab] = useState(ROUTES.IMPORT);
  const history = useHistory();

  const handleTabChange = useCallback(
    path => {
      history.push(path);
      setTab(path);
    },
    [history],
  );

  return (
    <>
      <section className={cx('container', 'is--fluid')}>
        <div className="row">
          <div className="col-12">
            <Tabs className={[style.content]}>
              <Tab
                index={ROUTES.IMPORT}
                title="import"
                onClick={() => handleTabChange(ROUTES.IMPORT)}
                active={selectedTab === ROUTES.IMPORT}
              />
              <Tab
                index={ROUTES.INTERCEPT}
                title="intercept"
                onClick={() => handleTabChange(ROUTES.INTERCEPT)}
                active={selectedTab === ROUTES.INTERCEPT}
              />
              <Tab
                index={ROUTES.UPDATE}
                title="update"
                onClick={() => handleTabChange(ROUTES.UPDATE)}
                active={selectedTab === ROUTES.UPDATE}
              />
            </Tabs>
          </div>
        </div>

        <Suspense fallback={<span />}>
          <Switch>
            <Route path={`${match.path}/import`}>
              <Import />
            </Route>
            <Route path={`${match.path}/intercept`}>
              <Intercept />
            </Route>
            <Route path={`${match.path}/update`}>
              <Update />
            </Route>
          </Switch>
        </Suspense>
      </section>
    </>
  );
};

Channels.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { Channels as default };

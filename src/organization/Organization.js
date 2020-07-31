/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  lazy,
  useState,
  useEffect,
  useContext,
  Suspense,
} from 'react';
import PropTypes from 'prop-types';
import { NavLink, Route, Switch } from 'react-router-dom';
import {
  mdiPlus,
  mdiDomain,
  mdiApi,
  mdiSettingsOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import Button from '../components/button/Button';
import Card from '../components/card/Card';
import { AuthContext } from '../auth/AuthContextService';
import style from './style.module.scss';

const AppSettings = lazy(() => import('./appSettings/AppSettings'));

const Organization = ({ match }) => {
  const { authorized, user } = useContext(AuthContext);
  const [role, setRole] = useState(0);

  useEffect(() => {
    if (authorized) {
      const { user_details: userDetails } = user();

      if (userDetails) {
        setRole(userDetails.role);
      }
    }
  }, [authorized, user]);

  return (
    <div className={style.organization}>
      <section className={cx('container', 'is--fluid')}>
        <div className="row">
          <div className="col-3">
            <Card header="Settings">
              <section className={style.navSection}>
                <ul className={style.navList}>
                  <li>
                    <NavLink
                      to={`${match.path}/app`}
                      activeClassName={style.active}
                    >
                      <Icon path={mdiSettingsOutline} size={1.3} />
                      App
                    </NavLink>
                  </li>
                  {role > 1 && (
                    <li>
                      <NavLink
                        to={`${match.path}/provisioning`}
                        activeClassName={style.active}
                      >
                        <Icon path={mdiDomain} size={1.3} />
                        Provisioning
                      </NavLink>
                    </li>
                  )}
                </ul>
              </section>
            </Card>
          </div>
          <div className="col-9">
            <Suspense fallback={<span />}>
              <Switch>
                <Route path={`${match.path}/app`}>
                  <AppSettings />
                </Route>
                <Route path={`${match.path}/provisioning`}>
                  <Card icon={mdiDomain} header="Provisioning">
                    <form>
                      <label htmlFor="orgName">
                        Organization Name
                        <input
                          type="text"
                          name="orgName"
                          className="fluid"
                        />
                      </label>
                      <label htmlFor="orgName">
                        Organization Domains
                        <input
                          type="text"
                          name="orgName"
                          className="fluid"
                        />
                        <input
                          type="text"
                          name="orgName"
                          className="fluid"
                        />
                        <input
                          type="text"
                          name="orgName"
                          className="fluid"
                        />
                      </label>
                      <div className={style.actions}>
                        <Button icon={mdiPlus}>Add Org</Button>
                      </div>
                    </form>
                  </Card>
                </Route>
              </Switch>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};

Organization.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { Organization as default };

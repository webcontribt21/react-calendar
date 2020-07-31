/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, useHistory } from 'react-router-dom';
import cx from 'classnames';
import { AuthContext } from '../auth/AuthContextService';
import style from './style.module.scss';
import { Tabs, Tab } from '../components/tabs/Tabs';
import Card from '../components/card/Card';
import { formatThousands } from '../utils/format';
import API from '../props';
import withParameters from '../utils/url';
import { get } from '../utils/fetch';

const Admin = lazy(() => import('./Admin'));
const Users = lazy(() => import('./Users'));
const Teams = lazy(() => import('./Teams'));

const ROUTES = {
  SUPER_ADMIN: '/users/admin',
  TEAMS: '/users/teams',
  USERS: '/users/management',
};

const UserManagement = ({ match }) => {
  const [superAdmin, showSuperAdmin] = useState(false);
  const { authorized, user } = useContext(AuthContext);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [selectedTab, setTab] = useState(ROUTES.USERS);
  const history = useHistory();

  const handleTabChange = useCallback(
    path => {
      history.push(path);
      setTab(path);
    },
    [history],
  );

  useEffect(() => {
    if (user()) {
      const { user_details: userDetails } = user();
      showSuperAdmin(userDetails.role >= 3);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    const response = await get(
      withParameters(
        API.users.default(),
        ['limit', 'offset'],
        [1, 0],
      ),
    ).then(res => res.json());

    if (response?.data) {
      const { total } = response;
      setTotalUsers(total);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    const response = await get(
      withParameters(
        API.teams.default(),
        ['limit', 'offset'],
        [1, 0],
      ),
    ).then(res => res.json());

    if (response?.data) {
      const { total } = response;
      setTotalTeams(total);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, [fetchTeams, fetchUsers]);

  return (
    <div className={style.organization}>
      <section className={cx('container', 'is--fluid')}>
        <div className={cx('row', style.content, style.cards)}>
          <div className="col-2">
            <Card>
              <div className={style.cardContent}>
                <header>
                  <h3>
                    {formatThousands(totalUsers)[0]}
                    <span>{formatThousands(totalUsers)[1]}</span>
                  </h3>
                </header>
                <div className={style.subHeader}>Users</div>
              </div>
            </Card>
          </div>
          <div className="col-2">
            <Card>
              <div className={style.cardContent}>
                <header>
                  <h3>{formatThousands(totalTeams)[0]}</h3>
                </header>
                <div className={cx(style.subHeader)}>Team</div>
              </div>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Tabs className={[style.content]}>
              <Tab
                index={ROUTES.USERS}
                title="Users"
                onClick={() => handleTabChange(ROUTES.USERS)}
                active={selectedTab === ROUTES.USERS}
              />
              <Tab
                index={ROUTES.TEAMS}
                title="Teams"
                onClick={() => handleTabChange(ROUTES.TEAMS)}
                active={selectedTab === ROUTES.TEAMS}
              />
              {superAdmin && (
                <Tab
                  index={ROUTES.SUPER_ADMIN}
                  title="Admin"
                  onClick={() => handleTabChange(ROUTES.SUPER_ADMIN)}
                  active={selectedTab === ROUTES.SUPER_ADMIN}
                />
              )}
            </Tabs>
            <Suspense fallback={<span />}>
              <Switch>
                <Route path={`${match.path}/admin`}>
                  <div className={style.userMgmt}>
                    <Admin />
                  </div>
                </Route>

                <Route path={`${match.path}/management`}>
                  <div className={style.userMgmt}>
                    <Users />
                  </div>
                </Route>

                <Route path={`${match.path}/teams`}>
                  <div className={style.teamMgmt}>
                    <Teams />
                  </div>
                </Route>
              </Switch>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};

UserManagement.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export { UserManagement as default };

import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { ThemeProvider } from '../ThemeProvider';
import Navigation from '../navigation/Navigation';
import PrivateRoute from './PrivateRoute';

import Admin from '../admin/Admin';
import KronologicCalendar from '../kronologicCalendar/KronologicCalendar';
import Calendar from '../calendar/Calendar';
import Contacts from '../contacts/Contacts';
import Channels from '../channels/Channels';
import Definitions from '../definitions/Definitions';
import Integrations from '../integrations/Integrations';
import Login from '../login/Login';
import Organization from '../organization/Organization';
import UserManagement from '../users/UserManagement';
import Templates from '../templates/Templates';
import MeetingInstances from '../mrm/MeetingInstances';

const roles = {
  ADMIN: 1,
  DEFAULT: 0,
  ORG: 2,
  SUPER_ADMIN: 3,
};

// TODO refactor the shit out of this repetetive code.
const RoutingService = () => {
  return (
    <ThemeProvider>
      <Router>
        <Navigation>
          <main>
            <Switch>
              <Route exact path="/" component={Login} />
              <PrivateRoute
                role={roles.ADMIN}
                exact
                path="/home"
                component={MeetingInstances}
              />
              <PrivateRoute
                role={roles.DEFAULT}
                path="/settings"
                component={Organization}
              />
              <PrivateRoute
                role={roles.ADMIN}
                path="/users"
                component={UserManagement}
              />
              <PrivateRoute
                role={roles.ADMIN}
                exact
                path="/automation"
                component={Admin}
              />
              <PrivateRoute
                role={roles.ORG}
                exact
                path="/integrations"
                component={Integrations}
              />
              <PrivateRoute
                role={roles.ADMIN}
                exact
                path="/meetings"
                component={Definitions}
              />
              <PrivateRoute
                role={roles.DEFAULT}
                exact
                path="/instances"
                component={MeetingInstances}
              />
              <PrivateRoute
                role={roles.SUPER_ADMIN}
                exact
                path="/templates"
                component={Templates}
              />
              <PrivateRoute
                role={roles.DEFAULT}
                exact
                path="/team/calendar"
                component={Calendar}
              />
              <PrivateRoute
                role={roles.DEFAULT}
                exact
                path="/user/calendar"
                component={KronologicCalendar}
              />
              <PrivateRoute
                role={roles.ADMIN}
                path="/contacts/:id"
                component={Contacts}
              />
              <PrivateRoute
                role={roles.ADMIN}
                path="/channels"
                component={Channels}
              />
              <PrivateRoute
                role={roles.ADMIN}
                path="/contacts"
                component={Contacts}
              />
              <Route exact path="/login" component={Login} />
            </Switch>
          </main>
        </Navigation>
      </Router>
    </ThemeProvider>
  );
};

export { RoutingService as default };

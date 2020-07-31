import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContextService';

const PrivateRoute = ({ component: Component, role, ...rest }) => {
  const { authorized, user } = useContext(AuthContext);
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const userSession = user();

    if (userSession && userSession.user_details) {
      setCurrentRole(userSession.user_details.role);
    }
  }, [user]);

  // TODO give time for user role.
  return (
    <Route
      {...rest}
      render={props => {
        if (authorized) {
          return <Component {...props} />;
        }

        return <Redirect to="/login" />;
      }}
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  role: PropTypes.number.isRequired,
};

export { PrivateRoute as default };

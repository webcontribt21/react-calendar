/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import AuthDispatcher from './AuthDispatcher';

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [auth] = useState(new AuthDispatcher());
  const [authorized, setAuthorized] = useState(auth.isAuthorized());

  useEffect(() => {
    auth.useProvider();
  }, [auth]);

  const login = async (creds = {}, token) => {
    const authResponse = await auth.login(creds, token);

    if (authResponse) {
      setAuthorized(auth.isAuthorized());
    }
  };

  const oAuth = async service => {
    await auth.oAuth(service);
  };

  const logout = async () => {
    await auth.logout();
    setAuthorized(auth.isAuthorized());
  };

  const switchProvider = async provider => {
    await auth.switchProvider(provider);
  };

  const defaultContext = {
    authorized,
    login,
    logout,
    oAuth,
    switchProvider,
    user: auth.getUser,
  };

  return (
    <AuthContext.Provider value={defaultContext}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export { AuthContext, AuthContextProvider };

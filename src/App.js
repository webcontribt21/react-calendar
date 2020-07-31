import { hot } from 'react-hot-loader/root';
import React from 'react';
import ReactHintFactory from 'react-hint';
import { AuthContextProvider } from './auth/AuthContextService';
import { ToastProvider } from './hooks/notifications/notifications';
import { AdminProvider } from './providers/AdminContext';
import RoutingService from './routing/RoutingService';

const ReactHint = ReactHintFactory(React);

const App = () => (
  <>
    <ReactHint events delay={{ hide: 0, show: 0 }} />
    <AuthContextProvider>
      <AdminProvider>
        <ToastProvider>
          <RoutingService />
        </ToastProvider>
      </AdminProvider>
    </AuthContextProvider>
  </>
);

export default hot(App);

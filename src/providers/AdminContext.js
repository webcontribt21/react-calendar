import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { mdiLogout } from '@mdi/js';
import cx from 'classnames';
import style from './style.module.scss';
import Button from '../components/button/Button';
import storage from '../utils/storage';

const store = storage();
const initialState = {
  actingAs: null,
};

const reducer = (info, newInfo) => {
  if (newInfo === null) {
    store.remove('info');
    return initialState;
  }
  return { ...info, ...newInfo };
};

const AdminContext = createContext();

function ActingBanner({ info, onClose }) {
  if (info.actingAs) {
    const { first, last } = info.actingAs;
    const name = `${first} ${last}`;

    const handleClose = () => {
      store.remove('info');
      onClose({ actingAs: null });
    };

    return (
      <div className={cx('banner', style.banner)}>
        <div className={style.user}>{name}</div>
        <Button icon={mdiLogout} onClick={handleClose} />
      </div>
    );
  }

  return null;
}

ActingBanner.propTypes = {
  info: PropTypes.objectOf(PropTypes.any).isRequired,
  onClose: PropTypes.func.isRequired,
};

function AdminProvider({ children }) {
  const [info, setInfo] = useReducer(
    reducer,
    store.get('info') || initialState,
  );

  useEffect(() => {
    if (info && info.actingAs) {
      store.add('info', info);
    }
  }, [info]);

  return (
    <AdminContext.Provider value={{ info, setInfo }}>
      <ActingBanner info={info} onClose={setInfo} />
      {children}
    </AdminContext.Provider>
  );
}

AdminProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element]).isRequired,
};

export { AdminContext, AdminProvider };

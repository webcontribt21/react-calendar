import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import Icon from '@mdi/react';
import style from './style.module.scss';

const Ctx = React.createContext();

const ToastContainer = props => (
  <div className={style.container} {...props} />
);

const Toast = ({ children, icon, onDismiss }) => {
  useEffect(() => {
    setTimeout(onDismiss, 3000);
  }, [onDismiss]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={style.notifications}
      onClick={onDismiss}
      onKeyPress={onDismiss}
    >
      {icon && <Icon path={icon} size={1} />}
      <span>{children}</span>
    </div>
  );
};

Toast.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
    .isRequired,
  icon: PropTypes.string,
  onDismiss: PropTypes.func.isRequired,
};

Toast.defaultProps = {
  icon: null,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const add = (content, icon) => {
    const id = shortid.generate();
    const toast = { content, icon, id };
    setToasts([...toasts, toast]);
  };

  const remove = id => {
    const newToasts = toasts.filter(t => t.id !== id);
    setToasts(newToasts);
  };

  const onDismiss = id => () => remove(id);

  return (
    <Ctx.Provider value={{ add, remove }}>
      {children}
      <ToastContainer>
        {toasts.map(({ content, id, ...rest }) => (
          <Toast
            key={id}
            Toast={Toast}
            onDismiss={onDismiss(id)}
            {...rest}
          >
            {content}
          </Toast>
        ))}
      </ToastContainer>
    </Ctx.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useToasts = () => React.useContext(Ctx);

import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import cx from 'classnames';
import googleLogoSVG from 'assets/google-logo.svg';
import microsoftLogoSVG from 'assets/microsoft-outlook-logo.svg';
import { mdiAlertOutline, mdiShieldAccountOutline } from '@mdi/js';
import { AuthContext } from '../auth/AuthContextService';
import Button from '../components/button/Button';
import * as AUTH from '../auth/constants';
import style from './login.module.scss';
import { useToasts } from '../hooks/notifications/notifications';
import Card from '../components/card/Card';

const Login = ({ location }) => {
  const { authorized, login, user } = useContext(AuthContext);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const query = new URLSearchParams(location.search);
  const { add } = useToasts();

  useEffect(() => {
    if (query && query.get('JWT-TOKEN')) {
      setToken(query.get('JWT-TOKEN'));
    } else if (query && query.get('error.code')) {
      setError(query.get('error.code'));
    }
  }, [query]);

  useEffect(() => {
    if (error) {
      add(
        'There was an internal error. Please try again later',
        mdiAlertOutline,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (token) {
      login({}, token);
    }
  }, [login, token]);

  if (authorized) {
    return <Redirect to="/home" />;
  }

  return (
    <section className="container">
      <div className="row">
        <div className={cx('col-12', style.authWrapper)}>
          <AuthForm />
        </div>
      </div>
    </section>
  );
};

Login.propTypes = {
  location: PropTypes.shape({
    hash: PropTypes.string,
    pathname: PropTypes.string,
    search: PropTypes.string,
    state: PropTypes.string,
  }).isRequired,
};

const AuthForm = () => {
  const { login, oAuth, switchProvider } = useContext(AuthContext);
  const [disabledCredsAuth, isCredsAuthDisabled] = useState(true);

  const oAuthService = async service => {
    if (service) {
      await switchProvider(AUTH.OAUTH_SERVICE);
      oAuth(service);
    }

    return false;
  };

  return (
    <Card
      header="login"
      icon={mdiShieldAccountOutline}
      className={[style.authCard]}
    >
      <form className={cx('row', style.authForm)} autoComplete="off">
        <div className={cx('col-12', style.authActions)}>
          <Button
            type="secondary"
            size="large"
            className={style.federatedBtn}
            onClick={() => oAuthService('google')}
          >
            <img src={googleLogoSVG} alt="signing with Google" />
            <span>sign in with google</span>
          </Button>
          <Button
            type="secondary"
            size="large"
            className={style.federatedBtn}
            onClick={() => oAuthService('o365')}
          >
            <img src={microsoftLogoSVG} alt="signin with o365" />
            <span>sign in with o365</span>
          </Button>
        </div>
        <div className="row">
          <div className="col-12">
            {!disabledCredsAuth && (
              <>
                <input
                  className={cx('fluid', style.field)}
                  type="email"
                  placeholder="you@company.xyz"
                  autoComplete="off"
                  disabled
                />
                <input
                  className={cx('fluid', style.field)}
                  type="password"
                  placeholder="password"
                  autoComplete="off"
                  disabled
                />
                <div className={style.actions}>
                  <Button disabled onClick={login}>
                    Login
                  </Button>
                  <Link to="/login" className={style.reminder}>
                    forgot password?
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
      <footer className={cx('row')}>
        <div className="col-12">
          By signing in, you agree to our
          <a
            href="https://app.kronologic.ai/pub/login/terms"
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms &amp; Conditions
          </a>
          and that you have read our
          <a
            href="https://app.kronologic.ai/pub/login/terms"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacy policy
          </a>
          .
        </div>
      </footer>
    </Card>
  );
};

export { Login as default };

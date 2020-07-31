import { Link, NavLink } from 'react-router-dom';
import {
  mdiChevronDown,
  mdiPower,
  mdiDomain,
  mdiWeatherNight,
  mdiBrightness5,
} from '@mdi/js';
import Icon from '@mdi/react';
import PropTypes from 'prop-types';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import logo from 'assets/logo.png';
import { AuthContext } from '../auth/AuthContextService';
import style from './navigation.module.scss';
import { useTheme } from '../ThemeProvider';
import useScroll from '../hooks/useScroll';
import Button from '../components/button/Button';
import { NAVIGATION } from './props';

const defaultProfileState = {
  avatar: '',
  email: '',
  first: '',
  full: '',
  last: '',
  org: '',
  role: 0,
  title: '',
};

const Navigation = ({ children }) => {
  const { authorized, user } = useContext(AuthContext);
  const [active, isActive] = useState(false);
  const [profile, setProfile] = useState(defaultProfileState);

  const { y } = useScroll();

  useEffect(() => {
    if (authorized) {
      const { user_details: userDetails } = user();

      if (userDetails) {
        setProfile({
          avatar: userDetails.profileURL,
          email: userDetails.email,
          first: userDetails.firstName,
          full: `${userDetails.firstName} ${userDetails.lastName}`,
          last: userDetails.lastName,
          org: userDetails.org.name,
          role: userDetails.role,
          title: userDetails.title,
        });
      }
    }
  }, [authorized, user]);

  const toggle = () => {
    isActive(!active);
  };

  const RoleLink = ({ role, path, icon, text, tooltip }) => {
    if (profile.role >= role) {
      return (
        <NavLink
          to={`/${path}`}
          className="nav-item"
          activeClassName="is-active"
        >
          <Icon
            path={icon}
            size={1}
            data-rh={tooltip}
            data-rh-at="bottom"
          />
          <span>{text}</span>
        </NavLink>
      );
    }

    return null;
  };

  RoleLink.propTypes = {
    icon: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  };

  return (
    <>
      <section
        className={cx('container is--fluid nav-wrapper', {
          useMinimalist: y >= 50,
        })}
      >
        <div className="row">
          <div className="col">
            <nav
              role="navigation"
              aria-label="main navigation"
              className={y >= 50 ? 'useMinimalist' : ''}
            >
              <button
                type="button"
                onClick={toggle}
                className={cx('nav-btn', { 'is-active': active })}
              >
                <span />
                <span />
                <span />
              </button>
              <Link to="/" className="nav-brand">
                <img src={logo} alt="Kronologic" className="logo" />
              </Link>

              <div
                className={cx('nav-main', { 'is-active': active })}
              >
                {authorized && (
                  <>
                    {NAVIGATION.map(nav => (
                      <RoleLink
                        key={`nav-item-${nav.id}`}
                        path={nav.path}
                        icon={nav.icon}
                        role={nav.role}
                        text={nav.text}
                        tooltip={nav.tooltip}
                      />
                    ))}
                    <div className="nav-item end">
                      <Profile
                        imgSrc={profile.avatar}
                        email={profile.email}
                        name={profile.full}
                        org={profile.org}
                      />
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </section>
      {children}
    </>
  );
};

Navigation.propTypes = {
  children: PropTypes.element,
};

Navigation.defaultProps = {
  children: null,
};

const Profile = ({ email, imgSrc, name, org }) => {
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const node = useRef();
  const themeState = useTheme();

  const toggleTheme = () => {
    return themeState.toggleTheme();
  };

  const toggle = e => {
    e.preventDefault();
    setOpen(!open);
  };

  const closeMenu = e => {
    if (node.current.contains(e.target)) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeMenu);

    return () => {
      document.removeEventListener('mousedown', closeMenu);
    };
  }, []);

  return (
    <ul ref={node} className={cx('nav-down', style.profile)}>
      <li>
        <button type="button" onClick={toggle}>
          {imgSrc && (
            <img
              src={imgSrc}
              className={style.profileImg}
              alt="profile"
            />
          )}
          {!imgSrc && <span className={style.email}>{email}</span>}
          <Icon
            rotate={open ? 180 : 0}
            path={mdiChevronDown}
            size={1}
          />
        </button>
        <ul className={cx({ 'is-close': !open })}>
          <li>{name}</li>
          <li>
            <Button
              onClick={toggleTheme}
              type="tertiary"
              icon={
                themeState.isDark ? mdiBrightness5 : mdiWeatherNight
              }
            >
              <span>
                {`Switch to ${
                  themeState.isDark ? 'light' : 'dark'
                } mode`}
              </span>
            </Button>
          </li>
          <li>
            <Link to="/settings/app">
              <Button type="tertiary" icon={mdiDomain}>
                <span>Settings</span>
              </Button>
            </Link>
          </li>
          <li>
            <Button type="tertiary" onClick={logout} icon={mdiPower}>
              <span>sign out</span>
            </Button>
          </li>
        </ul>
      </li>
    </ul>
  );
};

Profile.propTypes = {
  email: PropTypes.string,
  imgSrc: PropTypes.string,
  name: PropTypes.string,
  org: PropTypes.string,
};

Profile.defaultProps = {
  email: '',
  imgSrc: null,
  name: '',
  org: 'my organization',
};

export default Navigation;

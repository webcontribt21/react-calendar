import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';

const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Can only be used within the ThemeContext provider
const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};

const useDarkThemeEffect = () => {
  const [themeState, setThemeState] = useState({
    hasThemeLoaded: false,
    isDark: true,
  });

  useEffect(() => {
    const lsDark = localStorage.getItem('isDark') === 'true';
    if (lsDark) {
      document.querySelector('body').dataset.theme = 'dark';
    }
    setThemeState({
      hasThemeLoaded: true,
      isDark: lsDark,
    });
  }, []);

  return { setThemeState, themeState };
};

const ThemeProvider = ({ children }) => {
  const { themeState, setThemeState } = useDarkThemeEffect();

  if (!themeState.hasThemeLoaded) return <div />;

  const toggleTheme = () => {
    const isDark = !themeState.isDark;
    localStorage.setItem('isDark', JSON.stringify(isDark));

    const bodyEl = document.querySelector('body');

    if (isDark) {
      bodyEl.dataset.theme = 'dark';
    } else {
      bodyEl.dataset.theme = 'default';
    }

    setThemeState({ ...themeState, isDark });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark: themeState.isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export { ThemeProvider, useTheme };

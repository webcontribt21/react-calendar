/**
 * Default authentication service, needs to provide
 * two methods: login, logout
 * DefaultAuthService
 */
export default {
  login: ({ username, password }) => {
    /** Default auth logic... */
    const authResponse = { err: false, user: {} };
    return authResponse;
  },
  logout: () => {
    /** Default (username/password) logout logic... */
    return true;
  },
};

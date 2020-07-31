import jwtDecode from 'jwt-decode';
import API from '../../props';
import { get } from '../../utils/fetch';

/**
 * oAuth authentication service, needs to provide
 * two methods: login, logout
 * OAuthService
 */
export default {
  login: token => {
    const authResponse = { err: true, user: null };

    if (token) {
      authResponse.err = false;
      authResponse.user = jwtDecode(token);
    }

    return authResponse;
  },
  logout: async () => {
    const authUrlResponse = await get(API.auth.logout).then(
      res => res.status,
    );

    if (authUrlResponse) {
      window.location.href = `${process.env.APP_SERVICE}/`;
    }
  },
  oAuth: async service => {
    const url = API.auth[service];
    const authUrlResponse = await get(url).then(res => res.json());

    if (authUrlResponse) {
      window.location.href = authUrlResponse.url;
    }
  },
};

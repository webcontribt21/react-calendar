/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
import jwtDecode from 'jwt-decode';
import * as AUTH from './constants';

/**
 * services mapping have to equal the filename from
 * the service itself, i.e. ProviderAuthService.js
 * will mapped to a KEY: ProviderAuthService.
 */
const services = {
  [AUTH.DEFAULT_AUTH_SERVICE]: 'DefaultAuthService',
  [AUTH.OAUTH_SERVICE]: 'OAuthService',
};

const authLoader = (service = AUTH.DEFAULT_AUTH_SERVICE) =>
  import(`./service/${services[service]}`);

/**
 * Dispatches the proper auth service.
 *
 * @class AuthDispatcher
 */
class AuthDispatcher {
  constructor() {
    this.authToken = AUTH.AUTH_TOKEN;
    this.user = null;

    if (!AuthDispatcher.instance) {
      AuthDispatcher.instance = this;
    }

    return AuthDispatcher.instance;
  }

  async useProvider(provider = AUTH.DEFAULT_AUTH_SERVICE) {
    if (AuthDispatcher.instance) {
      AuthDispatcher.instance.authService = await authLoader(
        provider,
      );
      AuthDispatcher.instance.provider = provider;
    }
  }

  /**
   * Switches auth service provider. It logs out
   * then it does the switch.
   *
   * @memberof AuthDispatcher
   */
  async switchProvider(provider) {
    if (AuthDispatcher.instance && provider) {
      await AuthDispatcher.instance.logout();
      AuthDispatcher.instance.authService = await authLoader(
        provider,
      );
      AuthDispatcher.instance.provider = provider;
    }
  }

  getUser() {
    if (
      !AuthDispatcher.instance.user &&
      AuthDispatcher.instance.isAuthorized()
    ) {
      const user = jwtDecode(AuthDispatcher.instance.getToken());
      AuthDispatcher.instance.user = user;
    }

    return AuthDispatcher.instance.user;
  }

  clear() {
    localStorage.removeItem(AuthDispatcher.instance.authToken);
    AuthDispatcher.instance.user = null;
    return !AuthDispatcher.instance.isAuthorized();
  }

  async login(creds = {}, token = null) {
    if (!AuthDispatcher.instance.authService && token) {
      await AuthDispatcher.instance.useProvider(AUTH.OAUTH_SERVICE);
    } else if (!AuthDispatcher.instance.authService && !token) {
      await AuthDispatcher.instance.useProvider(
        AUTH.DEFAULT_AUTH_SERVICE,
      );
    }

    const authResponse = await AuthDispatcher.instance.authService.default.login(
      token || creds,
    );

    if (authResponse.err) {
      return AuthDispatcher.instance.clear();
    }

    localStorage.setItem(AuthDispatcher.instance.authToken, token);
    AuthDispatcher.instance.user = authResponse.user;

    return authResponse;
  }

  async oAuth(service) {
    await AuthDispatcher.instance.authService.default.oAuth(service);
  }

  async logout() {
    if (AuthDispatcher.instance.isAuthorized()) {
      await AuthDispatcher.instance.useProvider(AUTH.OAUTH_SERVICE);
    }

    await AuthDispatcher.instance.authService.default.logout();

    return AuthDispatcher.instance.clear();
  }

  isAuthorized() {
    return AuthDispatcher.instance.getToken() !== null;
  }

  getToken() {
    return localStorage.getItem(AuthDispatcher.instance.authToken);
  }
}

export default AuthDispatcher;

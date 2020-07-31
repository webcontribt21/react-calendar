import React, { useContext } from 'react';
import jwtDecode from 'jwt-decode';
import withParameters from './url';
import * as AUTH from '../auth/constants';
import storage from './storage';

const store = storage();

const request = (url, opts) => {
  const token = localStorage.getItem(AUTH.AUTH_TOKEN);
  const admin = store.get('info');

  // eslint-disable-next-line no-undef
  const headers = new Headers({
    'JWT-TOKEN': token,
    ...(admin?.actingAs
      ? { override: JSON.stringify(jwtDecode(admin.actingAs.jwt)) }
      : {}),
  });

  return fetch(url, {
    headers,
    method: 'GET',
    mode: 'cors',
    ...opts,
  }).then(res => {
    if (res.status !== 200) {
      throw new Error(res.status);
    }

    return res;
  });
};

const del = (url, qry = { data: [], params: [] }) => {
  let formattedURL = url;

  if (qry) {
    formattedURL = withParameters(url, qry.params, qry.data);
  }

  return request(formattedURL, {
    method: 'DELETE',
  });
};

const get = (url, qryParams = [], data = []) => {
  return request(withParameters(url, qryParams, data));
};

const patch = (url, qry = { data: [], params: [] }, body) => {
  let formattedURL = url;

  if (qry) {
    formattedURL = withParameters(url, qry.params, qry.data);
  }

  return request(formattedURL, {
    body: JSON.stringify(body),
    method: 'PATCH',
  });
};

const post = (url, qry = { data: [], params: [] }, body) => {
  let formattedURL = url;

  if (qry) {
    formattedURL = withParameters(url, qry.params, qry.data);
  }

  return request(formattedURL, {
    body: JSON.stringify(body),
    method: 'POST',
  });
};

export { request as default, del, get, patch, post };

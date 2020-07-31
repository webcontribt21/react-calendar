const withParameters = (url, qryParams = [], data = []) => {
  if (url && qryParams.length && data.length) {
    return `${url}?${qryParams
      .map((param, i) => {
        return `${param}=${data[i]}`;
      })
      .join('&')}`;
  }

  return url;
};

export { withParameters as default };

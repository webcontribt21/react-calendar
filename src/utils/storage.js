function storage() {
  const add = (field, value) => {
    localStorage.setItem(field, JSON.stringify(value));
  };

  const addRaw = (field, value) => {
    localStorage.setItem(field, value);
  };

  const get = field => {
    if (localStorage.getItem(field) !== null) {
      return JSON.parse(localStorage.getItem(field));
    }

    return null;
  };

  const remove = field => {
    if (localStorage.getItem(field) !== null) {
      return localStorage.removeItem(field);
    }

    return null;
  };

  return {
    add,
    addRaw,
    get,
    remove,
  };
}

export default storage;

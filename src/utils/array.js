const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {},
  );

const compareValues = (key, order = 'asc') => {
  return (a, b) => {
    const aHasProp = Object.prototype.hasOwnProperty.call(a, key);
    const bHasProp = Object.prototype.hasOwnProperty.call(b, key);

    if (!aHasProp || !bHasProp) {
      // property doesn't exist on either object
      return 0;
    }

    const varA =
      typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB =
      typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === 'desc' ? comparison * -1 : comparison;
  };
};

export { groupBy, compareValues };

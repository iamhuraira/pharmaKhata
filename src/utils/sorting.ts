const sort = (data: any[], key: string, sortOrder: 'asc' | 'desc') => {
  const sortedData = [...data].sort((a, b) => {
    if (typeof a[key] === 'number') {
      return sortOrder === 'asc' ? a[key] - b[key] : b[key] - a[key];
    } else {
      return sortOrder === 'asc'
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    }
  });

  return sortedData;
};

export default sort;

export function truncateString(str: string, num: number) {
  return str.length > num ? `${str.slice(0, num)}...` : str;
}

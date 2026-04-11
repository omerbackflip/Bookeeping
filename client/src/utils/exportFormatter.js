// called from main.js to make the Exports date format to DD/MM/YYYY globally available in the app

export function formatDataForExport(data) {
  const isISODate = (str) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(str);

  const pad = (value) => `${value}`.padStart(2, '0');

  const formatDateValue = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
    }

    if (typeof value === 'string' && isISODate(value)) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
      }
    }

    return value;
  };

  const format = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(format);
    }

    if (obj && typeof obj === 'object') {
      const newObj = {};

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];

        if (value instanceof Date || (typeof value === 'string' && isISODate(value))) {
          newObj[key] = formatDateValue(value);
        } else if (typeof value === 'object' && value !== null) {
          newObj[key] = format(value);
        } else {
          newObj[key] = value;
        }
      }

      return newObj;
    }

    return obj;
  };

  return format(data);
}
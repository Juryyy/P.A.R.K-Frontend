import { format, parseISO } from "date-fns";

const deepEqual = (obj1: any, obj2: any, array?: string[]): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  console.log('obj1:', obj1);

  const dateFields = array || [];

  // Get all keys from both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => {
    // Special handling for date fields
    if (dateFields.includes(key)) {
      const date1 = normalizeDateString(obj1[key]);
      const date2 = normalizeDateString(obj2[key]);
      return date1 === date2;
    }

    // For arrays (like roles)
    if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      return obj1[key].length === obj2[key].length &&
             obj1[key].every((item: any, index: number) => deepEqual(item, obj2[key][index]));
    }

    // For nested objects
    if (obj1[key] && typeof obj1[key] === 'object' && obj2[key] && typeof obj2[key] === 'object') {
      return deepEqual(obj1[key], obj2[key]);
    }

    // For all other values
    return obj1[key] === obj2[key];
  });
};

const normalizeDateString = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    console.error('Error normalizing date:', e);
    return '';
  }
};

export { deepEqual, normalizeDateString };

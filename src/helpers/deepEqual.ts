function deepEqual(obj1: any, obj2 : any) {
  if (obj1 === obj2) return true; // Check for strict equality

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false; // Check for non-object or null values
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false; // Different number of keys
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false; // Key exists in obj1 but not in obj2
    }

    if (!deepEqual(obj1[key], obj2[key])) {
      return false; // Recursive check for nested properties
    }
  }

  return true;
}

export default deepEqual;

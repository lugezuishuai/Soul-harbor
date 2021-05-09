export function deepClone(obj: Record<string, any>) {
  if (typeof obj !== 'object') {
    return;
  }
  const newObj = obj instanceof Array ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      //@ts-ignore
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
    }
  }

  return newObj;
}

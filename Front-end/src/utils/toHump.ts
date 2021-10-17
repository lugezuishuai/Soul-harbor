import { cloneDeep } from 'lodash-es';

export function transformCamel(name: string, toCamel = true) {
  const regx = toCamel ? /_[a-z]/g : /[A-Z]/g;

  return name.replace(regx, (str) => {
    return toCamel ? str[1].toUpperCase() : `_${str.toLowerCase()}`;
  });
}

// 默认是下划线转驼峰，false为驼峰转下划线
export function transformCamelObj(obj: Record<string, any>, toCamel = true) {
  const humpObj: Record<string, any> = {};

  for (const key in obj) {
    const value = typeof obj[key] === 'object' ? cloneDeep(obj[key]) : obj[key];
    humpObj[transformCamel(key, toCamel)] = value;
  }

  return humpObj;
}

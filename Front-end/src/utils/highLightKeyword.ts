// 高亮处理搜索关键字
export function highLightKeyword(value: string, keyword: string) {
  if (!keyword) {
    return value;
  }

  const regExp = new RegExp(keyword, 'g');
  return value.replace(regExp, `<span>${keyword}</span>`);
}

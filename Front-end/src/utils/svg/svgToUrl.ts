export function svgToUrl(svgStr: string) {
  const str = svgStr.replace(/\n+/g, '').replace(/['%<>#{}]/g, (str: string) => {
    switch (str) {
      case '"':
        return "'";
      case '%':
        return '%25';
      case '<':
        return '%3c';
      case '>':
        return '%3e';
      case '{':
        return '%7b';
      case '}':
        return '%7d';
      case '#':
        return '%23';
      default:
        return str;
    }
  });
  return `data:image/svg+xml,${str}`;
}

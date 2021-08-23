export function svgFillColor(svgStr: string, color: string): string {
  let result = svgStr;
  result = result
    .replace(/\>[\s\n]+\</g, '><')
    .replace(/fill=["']([^"']+)["']/g, '')
    .replace(/\<svg/, `<svg fill="${color}"`);
  return result;
}

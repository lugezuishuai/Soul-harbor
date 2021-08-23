export async function getSvg(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow',
    referrer: 'no-referrer',
  });
  const svg = await res.text();
  return svg;
}

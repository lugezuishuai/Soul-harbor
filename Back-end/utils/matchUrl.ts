export function matchUrls(url: string | null) {
  if (!url) {
    return;
  }
  const regExp = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i;
  const matchArr = regExp.exec(url);

  if (matchArr?.length !== 7) {
    return;
  }

  return {
    url: matchArr[0],
    protocol: matchArr[1],
    address: matchArr[2],
    port: matchArr[3],
    path: matchArr[4],
    search: matchArr[5],
    anchor: matchArr[6],
  };
}

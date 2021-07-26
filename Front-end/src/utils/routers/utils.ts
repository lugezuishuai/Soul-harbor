export function hasAuthority(auth: string[], authed: string[]) {
  if (!auth.length) {
    return true;
  }

  return auth.every((item) => authed.includes(item));
}

export function fnv32aHashCode(s: string) {
  // 随机种子
  const seed = 0x811c9dc5;
  let hVal = seed;

  for (let i = 0; i < s.length; i++) {
    hVal ^= s.charCodeAt(i);
    hVal += (hVal << 1) + (hVal << 4) + (hVal << 7) + (hVal << 8) + (hVal << 24);
  }

  return hVal.toString(16).substr(-8);
}

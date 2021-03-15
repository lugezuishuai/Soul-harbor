// 打断Promise
export function breakPromise() {
  return Promise.reject({
    notRealPromiseException: true,
  });
}
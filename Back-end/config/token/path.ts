// 不进行token解析的路径
export const notTokenPath = [
  /^\/api\/user\/[^init]/g,
  /^\/api\/employee\/(.*?)/g,
  /^\/api\/file\/(.*?)/g,
  /^\/static\/(.*?)/g,
]
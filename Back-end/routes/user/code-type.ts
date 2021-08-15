export enum UnSuccessCodeType {
  alreadyExit = 10001, // 已经存在
  noMatch = 10002, // 不匹配
  noPermission = 10003, // 没有权限
  clientError = 10004, // 客户端语法错误
  expiredOrUnValid = 10005, // 已经过期
  badAccount = 10006, // 不存在的账号
  invalidUuid = 10007, // 无效的uuid
}

export enum UnSuccessCodeType {
  alreadyExit = 10001, // 已经存在
  noMatch = 10002, // 不匹配
  expiredOrUnValid = 10003, // 已经过期
  badAccount = 10004, // 不存在的账号
  invalidUuid = 10005, // 无效的uuid
}

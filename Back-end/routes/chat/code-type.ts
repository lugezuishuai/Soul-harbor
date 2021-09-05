export enum UnSuccessCodeType {
  alreadyAddFriend = 10001, // 已经添加过该好友
  invalidUuid = 10002, // 无效的uuid
  noPermission = 10003, // 没有权限
  clientError = 10004, // 客户端语法错误
}

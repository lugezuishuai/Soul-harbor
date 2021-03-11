// getUserInfo
export interface GetUserInfoResponse {
  login: boolean;             // 是否已经登录
  userName: string;           // 用户名（账号）
  userId: string;             // 用户ID
  nickName: string;           // 昵称
  PersonalSignature: string;  // 个性签名
  avatar: string;             // 用户头像
  birth: string;              // 生日
}
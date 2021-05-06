export interface UserInfo {
  soulUsername: string;
  soulPassword: string;
  soulEmail: string;
  soulUuid: string;
  soulCreateTime: string;
  soulSignature: string | null;
  soulAvatar: string | null;
  soulBirth: string | null;
}

export interface ResUserInfo {
  username: string;
  uid: string;
  email: string;
  signature: string | null;
  birth: string | null;
  avatar: string | null;
}

export interface ChatSearchRes {
  online: boolean;
  userInfo: ResUserInfo;
}

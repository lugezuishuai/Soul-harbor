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

export interface SessionInfo {
  type: 'private' | 'room';
  sessionId: string; // 用户id | 房间id
  name: string; // 用户名 | 房间名
  avatar: string | null; // 用户头像 | 房间头像
  latestTime: number; // 秒为单位的时间戳
}

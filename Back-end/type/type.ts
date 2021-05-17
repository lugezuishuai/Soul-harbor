// 公共的类型维护在此处
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
  owner_id?: string; // 用户自己id
  sessionId: string; // 用户id | 房间id
  name: string; // 用户名 | 房间名
  avatar: string | null; // 用户头像 | 房间头像
  latestTime: number; // 秒为单位的时间戳
}

export interface MsgInfo {
  sender_id: string; // uuid
  receiver_id: string; // uuid
  sender_avatar: string | null; // 发送者头像
  message_id: number; // 递增
  message: string;
  time: string;
  type: 'online' | 'offline'; // 是否是离线信息
}

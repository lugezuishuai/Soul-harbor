export interface SessionInfo {
  type: 'private' | 'room';
  owner_id?: string; // 用户自己id
  sessionId: string; // 用户id | 房间id
  name: string; // 用户名 | 房间名
  avatar: string | null; // 用户头像 | 房间头像
  latestTime: number; // 秒为单位的时间戳
  latestMessage: string; // 最新的信息
}

export interface GetSessionsListData {
  sessionsList?: SessionInfo[];
}

export interface GetSessionsListRes {
  code: number;
  data: GetSessionsListData;
  msg: string;
}

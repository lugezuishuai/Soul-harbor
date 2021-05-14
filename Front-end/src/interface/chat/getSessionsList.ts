export interface SessionInfo {
  type: 'private' | 'room';
  sessionId: string; // 用户id | 房间id
  name: string; // 用户名 | 房间名
  avatar: string | null; // 用户头像 | 房间头像
  latestTime: number; // 秒为单位的时间戳
}

export interface GetSessionsListData {
  sessionsList?: SessionInfo[];
}

export interface GetSessionsListRes {
  code: number;
  data: GetSessionsListData;
  msg: string;
}

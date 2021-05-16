// readUnreadMsg
export interface ReadUnreadMsgReq {
  sessionId: string;
  type: 'private' | 'room';
}

export interface ReadUnreadMsgData {}

export interface ReadUnreadMsgRes {
  code: number;
  data: ReadUnreadMsgData;
  msg: string;
}

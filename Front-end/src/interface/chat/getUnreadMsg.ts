// getUnreadMsg
export interface PrivateMsgInfo {
  sender_id: string;
  receiver_id: string;
  message_id: string;
  message: string;
  time: string;
  type: 'online' | 'offline';
}

export interface UnreadMsg {
  [key: string]: PrivateMsgInfo[];
}

export interface GetUnreadMsgData {
  unreadPrivateMsg?: UnreadMsg;
}

export interface GetUnreadMsgRes {
  code: number;
  data: GetUnreadMsgData;
  msg: string;
}

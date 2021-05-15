// getUnreadMsg
export interface UnreadMsgInfo {
  sender_id: string;
  receiver_id: string;
  message_id: string;
  message: string;
  time: string;
  type: 'online' | 'offline';
  sender_avatar: string | null;
}

export interface UnreadMsg {
  [key: string]: UnreadMsgInfo[];
}

export interface GetUnreadMsgData {
  unreadPrivateMsg?: UnreadMsg;
}

export interface GetUnreadMsgRes {
  code: number;
  data: GetUnreadMsgData;
  msg: string;
}

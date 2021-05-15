// getHistoryMsg
export interface GetHistoryMsgReq {
  sessionId: string;
}

export interface HistoryMsgInfo {
  sender_id: string;
  receiver_id: string;
  message_id: string;
  message: string;
  time: string;
  type: 'online' | 'offline';
  sender_avatar: string | null;
}

export interface GetHistoryMsgData {
  message?: HistoryMsgInfo[];
}

export interface GetHistoryMsgRes {
  code: number;
  data: GetHistoryMsgData;
  msg: string;
}

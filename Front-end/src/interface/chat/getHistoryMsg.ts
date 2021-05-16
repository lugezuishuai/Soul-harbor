// getHistoryMsg
export interface GetHistoryMsgReq {
  sessionId: string;
}

export interface MsgInfo {
  sender_id: string; // uuid
  receiver_id: string; // uuid
  message_id: number; // 递增
  message: string;
  time: string;
  type: 'online' | 'offline'; // 是否是离线信息
  sender_avatar: string | null; // 发送者头像
}

export interface GetHistoryMsgData {
  message?: MsgInfo[];
}

export interface GetHistoryMsgRes {
  code: number;
  data: GetHistoryMsgData;
  msg: string;
}

// storeRobotChat
import { MsgInfo } from './getHistoryMsg';

export interface SendMessageBody {
  sender_id: string;
  sender_avatar: string | null;
  receiver_id: string;
  message_id: number;
  message: string;
  time: number; // 秒为单位的时间戳
}

export interface RobotChatReq {
  messageBody: SendMessageBody;
}

export interface RobotChatData {
  message?: MsgInfo;
}

export interface RobotChatRes {
  code: number;
  data: RobotChatData;
  msg: string;
}

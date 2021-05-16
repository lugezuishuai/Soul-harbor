// getUnreadMsg
import { MsgInfo } from "./getHistoryMsg";

export interface UnreadMsg {
  [key: string]: MsgInfo[];
}

export interface GetUnreadMsgData {
  unreadPrivateMsg?: UnreadMsg;
}

export interface GetUnreadMsgRes {
  code: number;
  data: GetUnreadMsgData;
  msg: string;
}

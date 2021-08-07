// searchChatRecords
export interface SearchChatRecordsRequest {
  sessionId: string;
  keyword: string;
}

export interface SearchChatRecord {
  sender_avatar: string | null;
  sender_id: string;
  sender_username: string;
  message: string;
  message_id: number;
  time: number; // 时间戳（秒为单位）
}

export interface SearchChatRecordsData {
  keyword: string;
  records: SearchChatRecord[];
}

export interface SearchChatRecordsRes {
  code: number;
  data: SearchChatRecordsData;
  msg: string;
}

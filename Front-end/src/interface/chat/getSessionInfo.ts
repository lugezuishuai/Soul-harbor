// getSessionInfo
import { SessionInfo } from './getSessionsList';

export interface GetSessionInfoReq {
  sessionId: string;
  type: 'private' | 'room';
}

export interface GetSessionInfoData {
  sessionInfo?: SessionInfo;
}

export interface GetSessionInfoRes {
  code: number;
  data: GetSessionInfoData;
  msg: string;
}

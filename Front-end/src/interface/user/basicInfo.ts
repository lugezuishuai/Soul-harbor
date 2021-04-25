// basicInfo
export interface BasicInfoRequest {
  userId: string;
  avatar?: string;
  signature?: string;
  birth?: string;
}

export interface BasicInfoData {
  avatar?: string;
}

export interface BasicInfoRes {
  code: number;
  data: BasicInfoData;
  msg: string;
}

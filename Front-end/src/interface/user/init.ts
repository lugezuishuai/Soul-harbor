// init
export interface UserInfo {
  username?: string;
  uid?: string;
  email?: string;
  birth?: string | null;
  signature?: string | null;
  avatar?: string | null;
}

export interface InitData {
  userInfo: UserInfo;
}

export interface InitResponse {
  code: number;
  msg: string;
  data: InitData;
}
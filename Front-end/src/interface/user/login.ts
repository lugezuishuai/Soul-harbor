// login
export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  username: string;
  uid: string;
  nickname: string;
  birth?: string | null;
  signature?: string | null;
  avatar?: string | null;
}

export interface LoginResData {
  token?: string;
  userInfo?: UserInfo;
}

export interface LoginResponse {
  code: number;
  msg: string;
  data: LoginResData;
}
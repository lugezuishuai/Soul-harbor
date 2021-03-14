// login
export interface LoginRequest {
  username: string;
  password: string;
}

export interface EmailLoginRequest {
  email: string;
  verifyCode: string;
}

export type WrapLoginRequest = LoginRequest | EmailLoginRequest;

export interface UserInfo {
  username: string;
  uid: string;
  email: string;
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
// register
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  verifyCode: string;
  createTime: string;
}

export interface RegisterResData {
  key?: string | number;
  id?: string | number;
}

export interface RegisterResponse {
  code: number;
  msg: string;
  data: RegisterResData;
}

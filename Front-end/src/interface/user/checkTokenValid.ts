// checkTokenValid
export interface CheckTokenValidRequest {
  resetPasswordToken: string
}

export interface CheckTokenValidData {
  username?: string;
}

export interface CheckTokenValidResponse {
  code: number;
  data: CheckTokenValidData,
  msg: string;
}
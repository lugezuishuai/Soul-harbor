// sendVerifyCode
export interface SendRegisterVCRequest {
  email: string
}

export interface SendRegisterVCData {

}

export interface SendRegisterVCResponse {
  code: number;
  data: SendRegisterVCData,
  msg: string;
}
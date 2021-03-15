// sendVerifyCode
export interface SendLoginVCRequest {
  email: string
}

export interface SendLoginVCData {

}

export interface SendLoginVCResponse {
  code: number;
  data: SendLoginVCData,
  msg: string;
}
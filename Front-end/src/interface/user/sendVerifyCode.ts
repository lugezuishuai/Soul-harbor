// sendVerifyCode
export interface SendVCRequest {
  email: string
}

export interface SendVCData {

}

export interface SendVCResponse {
  code: number;
  data: SendVCData,
  msg: string;
}
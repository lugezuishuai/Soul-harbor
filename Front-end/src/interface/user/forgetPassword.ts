// forgetPassword
export interface ForgetPasswordRequest {
  email: string
}

export interface ForgetPasswordData {

}

export interface ForgetPasswordResponse {
  code: number;
  data: ForgetPasswordData,
  msg: string;
}
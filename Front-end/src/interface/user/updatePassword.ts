// updatePassword
export interface UpdatePasswordReq {
  username: string;
  password: string;
}

export interface UpdatePasswordResData {

}

export interface UpdatePasswordRes {
  code: number;
  data: UpdatePasswordResData;
  msg: string;
}
// uploadAvatar
export interface UploadAvatarReq {
  avatar: File;
  userId: string;
}

export interface UploadAvatarResData {
  src?: string;
}

export interface UploadAvatarRes {
  code: number;
  data: UploadAvatarResData;
  msg: string;
}

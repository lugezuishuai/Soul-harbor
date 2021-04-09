// verifyFile
export interface VerifyFileRequest {
  fileHash: string;
  filename: string;
}

export interface VerifyFileData {
  fileExist?: boolean;
  uploadedList?: string[];
}

export interface VerifyFileRes {
  code: number;
  data: VerifyFileData;
  msg: string;
}

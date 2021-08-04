// searchMember
export interface SearchMemberRequest {
  keyword: string;
}

export interface UserInfo {
  username: string;
  uid: string;
  email: string;
  signature: string | null;
  birth: string | null;
  avatar: string | null;
}

export interface SearchMemberInfo {
  userInfo?: UserInfo;
  online?: boolean;
}

export interface SearchMemberInfoData {
  keyword: string;
  membersInfo: SearchMemberInfo[]
}

export interface SearchMemberRes {
  code: number;
  data: SearchMemberInfoData;
  msg: string;
}

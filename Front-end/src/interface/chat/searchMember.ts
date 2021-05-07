// searchMember
export interface SearchMemberRequest {
  search: string;
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

export interface SearchMemberRes {
  code: number;
  data: SearchMemberInfo[];
  msg: string;
}

import { MemberInfo } from "./newGroupChat";

// getGroupsMembers
export interface GetGroupMembersReq {
  room_id: string;
}

export interface GetGroupMembersData {
  members?: MemberInfo[];
}

export interface GetGroupMembersRes {
  code: number;
  data: GetGroupMembersData;
  msg: string;
}

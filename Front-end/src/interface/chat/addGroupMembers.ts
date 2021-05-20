// addGroupMembers
import { MemberInfo } from './newGroupChat';

export interface AddGroupMembersReq {
  room_id: string;
  members: MemberInfo[];
}

export interface AddGroupMemberData {}

export interface AddGroupMemberRes {
  code: number;
  data: AddGroupMemberData;
  msg: string;
}

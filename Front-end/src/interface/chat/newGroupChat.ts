// newGroupChat
export interface MemberInfo {
  member_id: string;
  member_username: string;
  member_avatar: string | null;
  member_role: 0 | 1; // 0表示群主，1表示普通成员
}

export interface NewGroupChatReq {
  members: MemberInfo[];
  room_name: string;
}

export interface NewGroupChatData {}

export interface NewGroupChatRes {
  code: number;
  data: NewGroupChatData;
  msg: string;
}

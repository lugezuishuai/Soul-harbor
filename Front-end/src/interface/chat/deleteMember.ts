// deleteMember
export interface DeleteMemberReq {
  member_id: string;
  room_id: string;
}

export interface DeleteMemberData {}

export interface DeleteMemberRes {
  code: number;
  data: DeleteMemberData;
  msg: string;
}

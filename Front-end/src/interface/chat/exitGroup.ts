// exitGroup
export interface ExitGroupReq {
  room_id: string;
}

export interface ExitGroupData {}

export interface ExitGroupRes {
  code: number;
  data: ExitGroupData;
  msg: string;
}

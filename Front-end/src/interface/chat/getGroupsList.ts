// getGroupsList
export interface RoomInfo {
  room_id: string;
  room_name: string;
  room_avatar: string | null;
}

export interface GetGroupsListData {
  rooms?: RoomInfo[];
}

export interface GetGroupsListRes {
  code: number;
  data: GetGroupsListData;
  msg: string;
}

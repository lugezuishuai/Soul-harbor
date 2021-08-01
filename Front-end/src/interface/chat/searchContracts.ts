import { FriendInfo } from './getFriendsList';

// searchContracts
export interface SearchContractsReq {
  keyword: string;
}

export interface SearchContractsRoomInfo {
  room_id: string;
  room_name: string;
  room_avatar: string | null;
  member_username: string[];
}

export interface SearchContractsData {
  friends: FriendInfo[];
  rooms: SearchContractsRoomInfo[];
  keyword: string;
}

export interface SearchContractsRes {
  code: number;
  data: SearchContractsData;
  msg: string;
}

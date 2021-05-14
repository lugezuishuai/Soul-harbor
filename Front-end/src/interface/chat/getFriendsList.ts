// getFriendsList
export interface FriendInfo {
  friend_id: string;
  friend_username: string;
  friend_avatar: string | null;
}

export interface GetFriendsListData {
  friendsList?: FriendInfo[];
}

export interface GetFriendsListRes {
  code: number;
  data: GetFriendsListData;
  msg: string;
}

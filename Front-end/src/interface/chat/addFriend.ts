// addFriend
export interface AddFriendRequest {
  friendId: string;
}

export interface AddFriendResData {}

export interface AddFriendRes {
  code: number;
  data: AddFriendResData;
  msg: string;
}

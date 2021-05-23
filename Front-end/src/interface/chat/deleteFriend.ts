// deleteFriend
export interface DeleteFriendReq {
  friendId: string;
}

export interface DeleteFriendData {}

export interface DeleteFriendRes {
  code: number;
  data: DeleteFriendData;
  msg: string;
}

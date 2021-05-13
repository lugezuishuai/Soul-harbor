import { EmployeeResponse } from '@/interface/employee';
import { UserInfo } from '@/interface/user/init';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
export type EmployeeState = {
  employeeList: EmployeeResponse;
};

export type UserInfoState = UserInfo | null;
export type LoginState = boolean | null;
export type SocketState = Socket<DefaultEventsMap, DefaultEventsMap> | null;
export type ChatActiveMenuState = 'chat' | 'friend';

export type UserState = {
  userInfo: UserInfoState;
  login: LoginState;
  userNameShow: boolean;
  userIdShow: boolean;
  emailShow: boolean;
};

export type HeaderState = {
  selectMenu: string;
};

export interface MessageBody {
  sender_id: string; // uuid
  receiver_id: string; // uuid
  message_id: number; // 递增
  message: string;
  time: string;
  type: 'online' | 'offline'; // 是否是离线信息
}

export interface UnreadChatMessage {
  // key是uid和room
  [key: string]: MessageBody[];
}

export interface FriendInfo {
  friend_id: string;
  friend_username: string;
  friend_avatar: string | null;
}

export type FriendList = FriendInfo[] | null;

export interface SessionInfo {
  type: 'private' | 'room';
  sessionId: string; // 用户id | 房间id
  name: string; // 用户名 | 房间名
  avatar: string | null; // 用户头像 | 房间头像
  latestTime: number; // 秒为单位的时间戳
}

export type SessionsList = SessionInfo[] | null;

export type ChatState = {
  socket: SocketState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
  // chatMessage: ChatMessageState;
  friendList: FriendList;
  sessionsList: SessionsList;
  unreadChatMessage: UnreadChatMessage;
};

export type State = Readonly<{
  employee: EmployeeState;
  user: UserState;
  header: HeaderState;
  chat: ChatState;
}>;

export const initialEmployeeState: EmployeeState = {
  employeeList: undefined,
};

export const initialUserState: UserState = {
  userInfo: null,
  login: null,
  userNameShow: false, // 显示或隐藏用户名
  userIdShow: false, // 显示或隐藏用户ID
  emailShow: false, // 显示或隐藏邮箱
};

export const initialHeaderState: HeaderState = {
  selectMenu: 'home', // 选中的菜单项
};

export const initialChatState: ChatState = {
  socket: null, // socket
  activeMenu: 'chat',
  isSearch: false,
  friendList: null,
  sessionsList: null,
  unreadChatMessage: {},
};

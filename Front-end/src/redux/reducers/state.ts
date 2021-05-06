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

export type ChatState = {
  socket: SocketState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
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
};

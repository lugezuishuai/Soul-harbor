import { EmployeeResponse } from '@/interface/employee';
import { UserInfo } from '@/interface/user/login';
export type EmployeeState = {
  employeeList: EmployeeResponse;
};

export type UserState = {
  userInfo: UserInfo | null;
  login: boolean | null;
  userNameShow: boolean;
  userIdShow: boolean;
};

export type Header = {
  selectMenu: string;
};

export type State = Readonly<{
  employee: EmployeeState;
  user: UserState;
  header: Header;
}>;

export const initialEmployeeState: EmployeeState = {
  employeeList: undefined,
};

export const initialUserState: UserState = {
  userInfo: null,
  login: null,
  userNameShow: false, // 显示或隐藏用户名
  userIdShow: false, // 显示或隐藏用户ID
};

export const initialHeaderState: Header = {
  selectMenu: 'home', // 选中的菜单项
};

import { EmployeeResponse } from '@/interface/employee';
import { UserInfo } from '@/interface/user/init';
export type EmployeeState = {
  employeeList: EmployeeResponse;
};

export type UserInfoState = UserInfo | null;
export type LoginState = boolean | null;

export type UserState = {
  userInfo: UserInfoState;
  login: LoginState;
  userNameShow: boolean;
  userIdShow: boolean;
  emailShow: boolean;
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
  emailShow: false, // 显示或隐藏邮箱
};

export const initialHeaderState: Header = {
  selectMenu: 'home', // 选中的菜单项
};

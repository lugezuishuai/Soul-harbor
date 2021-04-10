import { EmployeeResponse } from '@/interface/employee';
import { UserInfo } from '@/interface/user/login';
export type EmployeeState = {
  employeeList: EmployeeResponse;
};

export type UserState = {
  userInfo: UserInfo;
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
  userInfo: {
    username: 'jackson huang',
    uid: '12345678',
    email: 'jackson huang huang',
    signature: '人生真美丽',
    avatar: 'https://s1-fs.pstatp.com/static-resource-staging/v1/78c99186-2f3c-40aa-81b8-18591041db2g',
    birth: '1999-07-27',
  },
  login: null,
  userNameShow: false, // 显示或隐藏用户名
  userIdShow: false, // 显示或隐藏用户ID
};

export const initialHeaderState: Header = {
  selectMenu: '', // 选中的菜单项
};

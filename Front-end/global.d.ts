import { UserInfoState } from '@/redux/reducers/state';

declare global {
  interface Window {
    userInfo: UserInfoState;
  }
}

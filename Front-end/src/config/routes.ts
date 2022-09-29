import { WrapChatPage } from './../pages/chat';
import Content from '@/pages/home/content';
import ResetPw from '@/pages/updatePassword';
import UploadFile from '@/pages/upload';
import Employee from '@/pages/employee';
import UserInfo from '@/pages/user-info';
import { NotFound } from '@/pages/not-found';
import { NoPermission } from '@/pages/no-permission';
import { Error } from '@/pages/error-page';
import { RouteType } from './types/route-type';
import { WrapHome, WrapNoPermission } from '@/pages/home';
import { MarkDownCom } from '@/pages/markdown';
import { screen } from '@/constants/screen';
import { ChatSessionsMobile } from '@/pages/chat/mobile/pages/sessions';
import { ChatContractsMobile } from '@/pages/chat/mobile/pages/contracts';
import { AddFriendsMobile } from '@/pages/chat/mobile/pages/add-friend';
import { LaunchGroupChat } from '@/pages/chat/mobile/pages/launch-group-chat';
import { WrapConversationMobile } from '@/pages/chat/mobile/pages/conversation';

const { isMobile } = screen;

export const routes: RouteType[] = [
  {
    path: '/exception/403',
    component: NoPermission,
  },
  {
    path: '/exception/404',
    component: NotFound,
  },
  {
    path: '/exception/500',
    component: Error,
  },
  {
    path: '/reset/:token',
    component: ResetPw,
  },
  {
    path: '/',
    component: WrapHome,
    exact: false,
    routes: [
      {
        path: '/',
        component: Content,
      },
      {
        path: '/home',
        redirect: '/',
      },
      {
        path: '/chat',
        component: WrapChatPage,
        auth: ['login'],
        exact: false,
        replaceComponent: WrapNoPermission,
        routes: isMobile
          ? [
              {
                path: '/chat/sessions',
                component: ChatSessionsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/chat/contracts',
                component: ChatContractsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/chat/addFriends',
                component: AddFriendsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/chat/launchGroupChat',
                component: LaunchGroupChat,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/chat/conversation/:id',
                component: WrapConversationMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
            ]
          : [],
      },
      {
        path: '/news',
        component: UploadFile,
      },
      {
        path: '/blog',
        component: Employee,
      },
      {
        path: '/user/:id',
        component: UserInfo,
        auth: ['login'],
        replaceComponent: WrapNoPermission,
      },
      {
        path: '/markdown',
        component: MarkDownCom,
      },
    ],
  },
];

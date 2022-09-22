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
    path: '/soul-harbor/exception/403',
    component: NoPermission,
  },
  {
    path: '/soul-harbor/exception/404',
    component: NotFound,
  },
  {
    path: '/soul-harbor/exception/500',
    component: Error,
  },
  {
    path: '/soul-harbor/reset/:token',
    component: ResetPw,
  },
  {
    path: '/soul-harbor',
    component: WrapHome,
    exact: false,
    routes: [
      {
        path: '/soul-harbor',
        component: Content,
      },
      {
        path: '/soul-harbor/home',
        redirect: '/soul-harbor',
      },
      {
        path: '/soul-harbor/chat',
        component: WrapChatPage,
        auth: ['login'],
        exact: false,
        replaceComponent: WrapNoPermission,
        routes: isMobile
          ? [
              {
                path: '/soul-harbor/chat/sessions',
                component: ChatSessionsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/soul-harbor/chat/contracts',
                component: ChatContractsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/soul-harbor/chat/addFriends',
                component: AddFriendsMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/soul-harbor/chat/launchGroupChat',
                component: LaunchGroupChat,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
              {
                path: '/soul-harbor/chat/conversation/:id',
                component: WrapConversationMobile,
                auth: ['login'],
                replaceComponent: WrapNoPermission,
              },
            ]
          : [],
      },
      {
        path: '/soul-harbor/news',
        component: UploadFile,
      },
      {
        path: '/soul-harbor/blog',
        component: Employee,
      },
      {
        path: '/soul-harbor/user/:id',
        component: UserInfo,
        auth: ['login'],
        replaceComponent: WrapNoPermission,
      },
      {
        path: '/soul-harbor/markdown',
        component: MarkDownCom,
      },
    ],
  },
];

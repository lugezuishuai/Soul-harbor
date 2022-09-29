export interface MenuConfig {
  key: string;
  to: string | ((value: string) => string);
  text: string;
}

export const loginMenu: MenuConfig[] = [
  {
    key: 'user',
    to: (uid) => `/user/${uid}`,
    text: '个人信息',
  },
  {
    key: 'chat',
    to: '/chat',
    text: '聊天',
  },
  {
    key: 'blog',
    to: '/blog',
    text: '博客',
  },
  {
    key: 'news',
    to: '/news',
    text: '资讯',
  },
];

export const noLoginMenu: MenuConfig[] = [
  {
    key: 'chat',
    to: '/chat',
    text: '聊天',
  },
  {
    key: 'blog',
    to: '/blog',
    text: '博客',
  },
  {
    key: 'news',
    to: '/news',
    text: '资讯',
  },
];

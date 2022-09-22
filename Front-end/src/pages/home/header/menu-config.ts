export interface MenuConfig {
  key: string;
  to: string | ((value: string) => string);
  text: string;
}

export const loginMenu: MenuConfig[] = [
  {
    key: 'user',
    to: (uid) => `/soul-harbor/user/${uid}`,
    text: '个人信息',
  },
  {
    key: 'chat',
    to: '/soul-harbor/chat',
    text: '聊天',
  },
  {
    key: 'blog',
    to: '/soul-harbor/blog',
    text: '博客',
  },
  {
    key: 'news',
    to: '/soul-harbor/news',
    text: '资讯',
  },
];

export const noLoginMenu: MenuConfig[] = [
  {
    key: 'chat',
    to: '/soul-harbor/chat',
    text: '聊天',
  },
  {
    key: 'blog',
    to: '/soul-harbor/blog',
    text: '博客',
  },
  {
    key: 'news',
    to: '/soul-harbor/news',
    text: '资讯',
  },
];

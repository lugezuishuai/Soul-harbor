import Exception403IMG from '@/assets/image/403.png';
import Exception404IMG from '@/assets/image/404.png';
import Exception500IMG from '@/assets/image/500.png';

export enum ExceptionType {
  noPermission = '403',
  notFound = '404',
  error = '500',
}

export const ExceptionConfig = {
  [ExceptionType.noPermission]: {
    img: Exception403IMG,
    title: '403',
    desc: '抱歉，你无权访问该页面',
    backText: '返回首页',
  },
  [ExceptionType.notFound]: {
    img: Exception404IMG,
    title: '404',
    desc: '抱歉，你访问的页面不存在',
    backText: '返回首页',
  },
  [ExceptionType.error]: {
    img: Exception500IMG,
    title: '500',
    desc: '抱歉，服务器出错了',
    backText: '返回首页',
  },
};
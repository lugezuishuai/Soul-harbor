// employee相关
export const GET_EMPLOYEE = 'GET_EMPLOYEE';
export const CREATE_EMPLOYEE = 'CREATE_EMPLOYEE';
export const DELETE_EMPLOYEE = 'DELETE_EMPLOYEE';
export const UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE';

// 用户信息相关action
export const GET_USERINFO = 'GET_USERINFO'; // 获取用户信息
export const SET_AUTHED = 'SET_AUTHED'; // 当前用户权限
export const CHANGE_SHOW_USERNAME = 'CHANGE_SHOW_USERNAME'; // 改变用户名的显示状态
export const CHANGE_SHOW_USERID = 'CHANGE_SHOW_USERID'; // 改变用户ID的显示状态
export const CHANGE_SHOW_EMAIL = 'CHANGE_SHOW_EMAIL'; // 翻遍用户email的显示状态
export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'; // 改变用户登录状态

// header菜单相关action
export const CHANGE_SELECT_MENU = 'CHANGE_SELECT_MENU'; // 改变选择的菜单

// chat相关
export const INSERT_SOCKET = 'INSERT_SOCKET'; // 插入socket
export const CHANGE_ACTIVE_MENU = 'CHANGE_ACTIVE_MENU'; // 改变聊天界面的menu
export const GET_FRIENDS_LIST_ACTION = 'GET_FRIENDS_LIST_ACTION'; // 查看好友列表
export const GET_SESSIONS_LIST_ACTION = 'GET_SESSIONS_LIST_ACTION'; // 查看会话列表
export const IS_SEARCH = 'IS_SEARCH'; // 是否正在搜索
export const UNREAD_MESSAGE = 'UNREAD_MESSAGE'; // 总的未读信息
export const UNREAD_MESSAGE_COUNT = 'UNREAD_MESSAGE_COUNT'; // 未读信息条数
export const SELECT_SESSION = 'SELECT_SESSION'; // 选中的会话
export const PRIVATE_CHAT = 'PRIVATE_CHAT'; // 私聊信息
export const ACTIVE_SESSION = 'ACTIVE_SESSION'; // 有未读信息的session
export const ACTIVE_MSG = 'ACTIVE_MSG'; // 未读信息
export const FRIENDS_LIST_FOLD = 'FRIENDS_LIST_FOLD'; // 好友列表是否折叠
export const GROUPS_LIST_FOLD = 'GROUPS_LIST_FOLD'; // 群组列表是否折叠
export const GET_GROUPS_LIST_ACTION = 'GET_GROUPS_LIST_ACTION'; // 查看群列表
export const UPDATE_SESSION_INFO = 'UPDATE_SESSION_INFO'; // 更新会话信息
export const DELETE_SESSION_INFO = 'DELETE_SESSION_INFO'; // 删除会话信息
export const DELETE_FRIEND_ACTION = 'DELETE_FRIEND_ACTION'; // 删除好友

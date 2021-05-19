export const GET_EMPLOYEE_URL = '/api/employee/getEmployee';
export const CREATE_EMPLOYEE_URL = '/api/employee/createEmployee';
export const DELETE_EMPLOYEE_URL = '/api/employee/deleteEmployee';
export const UPDATE_EMPLOYEE_URL = '/api/employee/updateEmployee';
export const DOWNLOAD_EMPLOYEE_URL = '/api/employee/downloadEmployee';

export const REGISTER_URL = '/api/user/register'; // 注册用户的接口
export const USERNAMELOGIN_URL = '/api/user/login'; // 用户名密码登录接口
export const EMAILLOGIN_URL = '/api/user/loginByEmail'; // 邮箱验证码登录接口
export const SENDLOGINVC_URL = '/api/user/sendLoginVerifyCode'; // 发送登录验证码接口
export const SENDREGISTERVC_URL = '/api/user/sendRegisterVerifyCode'; // 发送注册验证码接口
export const SENDFORGETPASSWORD_LINK = '/api/user/forgetPassword'; // 发送「忘记密码」验证链接接口
export const CHECKTOKENVALID = '/api/user/checkTokenValid'; // 检查「忘记密码」重置链接是否有效接口
export const UPDATEPASSWORD = '/api/user/updatePassword'; // 重设密码接口
export const INIT = '/api/user/init'; // 获取token的接口
export const XSRFINIT = '/api/user/xsrf'; // 设置xsrfToken
export const LOGOUT = '/api/user/logout'; // 退出登录的接口
export const UPLOADAVATAR = '/api/user/avatar-upload'; // 上传用户头像的接口
export const BASICINFO = '/api/user/basic-info'; // 修改用户基础信息的接口

export const UPLOADCHUNK = '/api/file/uploadChunks'; // 上传文件的接口
export const MERGECHUNK = '/api/file/mergeChunks'; // 合并文件的接口
export const CHECKCHUNK = '/api/file/verifyChunks'; // 验证文件的接口

export const SEARCH_MEMBER = '/api/chat/search'; // 聊天搜索用户的接口
export const GET_UNREAD_MSG = '/api/chat/unread'; // 查看未读信息
export const GET_FRIENDS_LIST = '/api/chat/getFriendsList'; // 查看好友列表
export const GET_SESSIONS_LIST = '/api/chat/getSessionsList'; // 查看会话列表
export const ADD_FRIEND = '/api/chat/addFriend'; // 添加好友
export const GET_HISTORY_MSG = '/api/chat/getHisMsg'; // 获取某个回话的历史信息
export const READ_UNREAD_MSG = '/api/chat/readUnreadMsg'; // 查阅未读信息
export const ROBOT_CHAT = '/api/chat/robotChat'; // 机器人聊天
export const NEW_GROUP_CHAT = '/api/chat/newGroupChat'; // 新建群聊

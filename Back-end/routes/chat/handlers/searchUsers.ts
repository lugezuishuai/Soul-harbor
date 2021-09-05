import { Request, Response } from 'express';
import { UserInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { query } from '../../../utils/query';
import { format } from 'sqlstring';
import { redisGet } from '../../../utils/redis';
import { isNullOrUndefined } from '../../../utils/isNullOrUndefined';

const { noPermission } = UnSuccessCodeType;

interface ResUserInfo {
  username: string;
  uid: string;
  email: string;
  signature: string | null;
  birth: string | null;
  avatar: string | null;
}

interface ChatSearchRes {
  online: boolean;
  userInfo: ResUserInfo;
}

// 根据邮箱和用户名搜索用户
export async function searchUsers(req: Request, res: Response) {
  try {
    const { uuid } = req.cookies;
    // @ts-ignore
    const { token } = req.session;
    if (!(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }
    let { keyword }: any = req.query;
    keyword = keyword.replace(/'|‘/g, '');
    const searchByUsernameOrEmail = format(
      'select * from soul_user_info where binary soul_username like ? or binary soul_email like ?',
      [`%${keyword}%`, `%${keyword}%`]
    );
    const result: UserInfo[] = await query(searchByUsernameOrEmail);

    const lastResult = result.length
      ? await Promise.all(
          result.map(async (user) => {
            const { soul_username, soul_email, soul_uuid, soul_signature, soul_avatar, soul_birth } = user;
            const userId = soul_uuid.slice(0, 8);

            const userInfo: ResUserInfo = {
              username: soul_username,
              uid: soul_uuid,
              email: soul_email,
              signature: soul_signature,
              birth: soul_birth,
              avatar: soul_avatar,
            };

            const data: ChatSearchRes = {
              userInfo,
              online: false,
            };

            const reply = await redisGet(`socket_${userId}`);

            if (!isNullOrUndefined(reply)) {
              data.online = true;
            }

            return data;
          })
        )
      : [];

    const onlineUsers = lastResult.filter((user) => user.online);
    const offlineUsers = lastResult.filter((user) => !user.online);

    const searchedUsers = onlineUsers.concat(offlineUsers);
    const resData = {
      keyword,
      membersInfo: searchedUsers,
    };

    return res.status(200).json({
      code: 0,
      data: resData,
      msg: 'search success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

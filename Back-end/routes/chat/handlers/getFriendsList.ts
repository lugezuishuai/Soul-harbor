import { Request, Response } from 'express';
import { FriendInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { escape } from 'sqlstring';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

// 拉取好友列表
export async function getFriendsList(req: Request, res: Response) {
  try {
    const { uuid } = req.cookies;
    // @ts-ignore
    const { token } = req.session;
    if (!isDevelopment && !(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    const searchFriends = `select friend_id, friend_username, friend_avatar from tb_friend where user_id = ${escape(
      uuid
    )} order by add_time asc`; // 按照添加时间升序排列

    const friendsList: FriendInfo[] = await query(searchFriends);

    return res.status(200).json({
      code: 0,
      data: {
        friendsList,
      },
      msg: 'success',
    });
  } catch (e: any) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

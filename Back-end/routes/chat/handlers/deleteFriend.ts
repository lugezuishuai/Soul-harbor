import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { redisDel, redisGet } from '../../../utils/redis';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';
import { isDevelopment } from '../../../config/constant';

const { noPermission, clientError } = UnSuccessCodeType;

// 删除好友
export async function deleteFriend(req: Request, res: Response) {
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

    const { friendId } = req.body;

    const searchFriend = format('select * from tb_friend where user_id = ? and friend_id = ?', [uuid, friendId]);
    const searchOtherFriend = format('select * from tb_friend where user_id = ? and friend_id = ?', [friendId, uuid]);

    const result: any[] = await Promise.all([query(searchFriend), query(searchOtherFriend)]);

    if (result.length !== 2) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client error',
      });
    } else if (result[0].length !== 1 || result[1].length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client error',
      });
    } else {
      // 验证通过，两人互为好友
      const deleteFriend = format(
        'delete from tb_friend where (user_id = ? or user_id = ?) and (friend_id = ? or friend_id = ?)',
        [uuid, friendId, uuid, friendId]
      );
      await query(deleteFriend);

      const ownSession = await redisGet(`session_${uuid}_${friendId}`);
      const otherSession = await redisGet(`session_${friendId}_${uuid}`);

      if (ownSession) {
        redisDel(`session_${uuid}_${friendId}`);
      }

      if (otherSession) {
        redisDel(`session_${friendId}_${uuid}`);
      }

      return res.status(200).json({
        code: 0,
        data: {},
        msg: 'success',
      });
    }
  } catch (e: any) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

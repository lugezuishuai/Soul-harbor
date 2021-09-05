import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';

const { noPermission } = UnSuccessCodeType;

// 用户点击查看未读信息
export async function readUnreadMsg(req: Request, res: Response) {
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

    const { sessionId, type } = req.body; // roomId || uuid

    const updateUnreadMsg =
      type === 'private'
        ? format(
            `update tb_private_chat set type = 'online' where type = 'offline' and sender_id = ? and receiver_id = ?`,
            [sessionId, uuid]
          )
        : format(`update tb_room_chat set type = 'online' where type = 'offline' and receiver_id = ?`, [sessionId]);

    await query(updateUnreadMsg);

    return res.status(200).json({
      code: 0,
      data: {},
      msg: 'update success',
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

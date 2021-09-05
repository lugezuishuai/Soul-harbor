import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';

const { noPermission, clientError } = UnSuccessCodeType;

// 退出群聊
export async function exitGroup(req: Request, res: Response) {
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

    const { room_id } = req.body;
    const searchMember = format('select * from room_member where room_id = ? and member_id = ?', [room_id, uuid]);
    const result = await query(searchMember);

    if (!result || result.length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'invalid uuid or invalid room_id',
      });
    }

    const exitGroup = format('delete from room_member where room_id = ? and member_id = ?', [room_id, uuid]);
    await query(exitGroup);

    return res.status(200).json({
      code: 0,
      data: {},
      msg: 'success',
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

import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';

const { noPermission, clientError } = UnSuccessCodeType;

// 删除群成员
export async function deleteMember(req: Request, res: Response) {
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

    const { member_id, room_id } = req.body;

    // 判断有没有删除群成员的权限
    const hasAbility = format('select * from room_member where member_id = ? and room_id = ? and member_role = ?', [
      uuid,
      room_id,
      0,
    ]);
    const result = await query(hasAbility);

    if (!result) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    } else if (result.length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client Error',
      });
    } else {
      const deleteMember = format('delete from room_member where member_id = ? and room_id = ?', [member_id, room_id]);
      await query(deleteMember);

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

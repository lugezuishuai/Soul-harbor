import { Request, Response } from 'express';
import { MemberInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { escape } from 'sqlstring';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

// 获取群成员列表
export async function getGroupMembers(req: Request, res: Response) {
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
    const { room_id } = req.query;
    const getGroupMembers = `select member_id, member_username, member_avatar, member_role from room_member where room_member.room_id = ${escape(
      room_id
    )} order by join_time asc`; // 按照入群时间排序
    const result: MemberInfo[] = await query(getGroupMembers);

    if (!result?.length) {
      return res.status(200).json({
        code: 0,
        data: {
          members: [],
        },
        msg: 'success',
      });
    }

    return res.status(200).json({
      code: 0,
      data: {
        members: result,
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

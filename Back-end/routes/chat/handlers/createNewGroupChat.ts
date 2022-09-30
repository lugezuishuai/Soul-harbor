import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../utils/query';
import dayjs from 'dayjs';
import { MemberInfo } from '../../../type/type';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';
import { batchInsertMembers } from '../utils/batchInsertMembers';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

interface NewGroupChatReq {
  members: MemberInfo[];
  room_name: string;
}

// 发起群聊
export async function createNewGroupChat(req: Request, res: Response) {
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

    const { members, room_name }: NewGroupChatReq = req.body;
    const room_id = uuidv4();

    const buildGroup = format(
      'insert into room_info (room_id, room_name, room_create_time, room_create_id) values (?, ?, ?, ?)',
      [room_id, room_name, dayjs().unix(), uuid]
    );
    await query(buildGroup);
    await query(batchInsertMembers(members, room_id));

    return res.status(200).json({
      code: 0,
      data: {},
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

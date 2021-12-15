import { Request, Response } from 'express';
import { MemberInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { batchInsertMembers } from '../utils/batchInsertMembers';
import { escape } from 'sqlstring';

const { noPermission, clientError } = UnSuccessCodeType;

interface AddGroupMemberReq {
  members: MemberInfo[];
  room_id: string;
}

// 添加群成员
export async function addGroupMembers(req: Request, res: Response) {
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
    const { room_id, members }: AddGroupMemberReq = req.body;
    const newMembersIds = members.map((memberInfo) => memberInfo.member_id); // 新添加用户的id

    const searchOldMemberIds = `select member_id from room_member where room_id = ${escape(room_id)}`;
    const result: { member_id: string }[] = await query(searchOldMemberIds);

    if (!result?.length) {
      // 该群组没有任何成员
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'no members',
      });
    }

    const alreadyAddMember = newMembersIds.some((id) => result.some((item) => item.member_id === id));

    if (alreadyAddMember) {
      // 已经添加了某个成员
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'already add members',
      });
    }
    const addGroupMembers = batchInsertMembers(members, room_id);

    await query(addGroupMembers);

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

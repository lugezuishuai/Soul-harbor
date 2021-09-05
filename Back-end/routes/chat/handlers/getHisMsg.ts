import { Request, Response } from 'express';
import { MsgInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { query } from '../../../utils/query';

const { noPermission } = UnSuccessCodeType;

// 用户查看指定会话信息
export async function getHisMsg(req: Request, res: Response) {
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

    const { sessionId, type } = req.query; // roomId || uuid

    const searchMsg =
      type === 'private'
        ? `select * from tb_private_chat where (sender_id = '${uuid}' or sender_id = '${sessionId}') and (receiver_id = '${uuid}' or receiver_id = '${sessionId}') order by message_id asc`
        : `select * from tb_room_chat where receiver_id = '${sessionId}' order by message_id asc`; // 按照message_id升序来排列

    const result: MsgInfo[] = await query(searchMsg);

    return res.status(200).json({
      code: 0,
      data: {
        message: result,
      },
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

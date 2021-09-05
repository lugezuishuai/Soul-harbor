import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { MsgInfo } from '../../../type/type';
import { query } from '../../../utils/query';
import { escape } from 'sqlstring';

const { noPermission } = UnSuccessCodeType;

interface UnreadPrivateMsg {
  [key: string]: MsgInfo[];
}

// 查看是否有未读信息
export async function getUnreadMessage(req: Request, res: Response) {
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

    const searchUnreadMsg = `select * from tb_private_chat where receiver_id = ${escape(
      uuid
    )} and type = 'offline' order by message_id asc`; // 按照message_id升序来排列
    const result: MsgInfo[] = await query(searchUnreadMsg);

    if (!result || result.length === 0) {
      // 没有未读信息
      return res.status(200).json({
        code: 0,
        data: {
          unreadPrivateMsg: {},
        },
        msg: 'success',
      });
    }

    const unreadPrivateMsg: UnreadPrivateMsg = {};

    result.forEach((msgInfo) => {
      if (unreadPrivateMsg[msgInfo.sender_id]) {
        unreadPrivateMsg[msgInfo.sender_id].push(msgInfo);
      } else {
        unreadPrivateMsg[msgInfo.sender_id] = [msgInfo];
      }
    });

    return res.status(200).json({
      code: 0,
      data: {
        unreadPrivateMsg,
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

import { Request, Response } from 'express';
import { isDevelopment } from '../../../config/constant';
import { SessionInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { batchGetSessions } from '../../../utils/redis';
import { UnSuccessCodeType } from '../code-type';

const { noPermission } = UnSuccessCodeType;

// 拉取会话列表
export async function getSessionsList(req: Request, res: Response) {
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

    const result: SessionInfo[][] = await batchGetSessions(uuid);

    if (!result || result.length !== 2) {
      return res.status(500).json({
        code: 1,
        data: {},
        msg: 'server error',
      });
    }

    const sessionsList = [...result[0], ...result[1]];

    return res.status(200).json({
      code: 0,
      data: {
        sessionsList,
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

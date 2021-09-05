import { Request, Response } from 'express';
import { SessionInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { redisGet } from '../../../utils/redis';
import { UnSuccessCodeType } from '../code-type';

const { noPermission } = UnSuccessCodeType;

// 拉取某个会话信息
export async function getSessionInfo(req: Request, res: Response) {
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

    const { sessionId, type } = req.query;
    if (type === 'private') {
      const sessionInfo: SessionInfo | null = JSON.parse(await redisGet(`session_${uuid}_${sessionId}`));

      if (!sessionInfo) {
        return res.status(200).json({
          code: 0,
          data: {},
          msg: 'success',
        });
      }

      return res.status(200).json({
        code: 0,
        data: {
          sessionInfo,
        },
        msg: 'success',
      });
    } else {
      const sessionInfo: SessionInfo | null = JSON.parse(await redisGet(`room_session_${sessionId}`));

      if (!sessionInfo) {
        return res.status(200).json({
          code: 0,
          data: {},
          msg: 'success',
        });
      }

      return res.status(200).json({
        code: 0,
        data: {
          sessionInfo,
        },
        msg: 'success',
      });
    }
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

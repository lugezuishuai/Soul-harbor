import { Request, Response } from 'express';
import { RoomInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { escape } from 'sqlstring';

const { noPermission, clientError } = UnSuccessCodeType;

function batchSearchRoomInfo(roomIds: string[]) {
  let batchSearchRoomInfo = `select room_id, room_avatar, room_name from room_info where room_info.room_id in (`;
  roomIds.forEach((roomId, index) => {
    if (index === roomIds.length - 1) {
      batchSearchRoomInfo += `${escape(roomId)})`;
    } else {
      batchSearchRoomInfo += `${escape(roomId)}, `;
    }
  });

  batchSearchRoomInfo += ' order by room_create_time asc'; // 按照群组创建时间升序排序

  return batchSearchRoomInfo;
}

// 获取群列表
export async function getGroupsList(req: Request, res: Response) {
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

    const getGroupsId = `select room_id from room_member where member_id = ${escape(uuid)}`;

    const result: { room_id: string }[] = await query(getGroupsId);

    if (!result?.length) {
      return res.status(200).json({
        code: 0,
        data: {
          rooms: [],
        },
        msg: 'success',
      });
    }

    const roomIds = result.map((item) => item.room_id);
    const roomInfos: RoomInfo[] = await query(batchSearchRoomInfo(roomIds));

    if (!roomInfos || !roomInfos.length) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'failed',
      });
    }

    return res.status(200).json({
      code: 0,
      data: {
        rooms: roomInfos,
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

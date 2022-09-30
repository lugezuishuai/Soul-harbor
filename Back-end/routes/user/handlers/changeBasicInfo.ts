import { Request, Response } from 'express';
import { format } from 'sqlstring';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { query } from '../../../utils/query';
import { batchSetSessionsAvatar } from '../../../utils/redis';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

export async function changeBasicInfo(req: Request, res: Response) {
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

    const { signature, birth, avatar } = req.body;
    const soul_uuid = uuid || '',
      soul_signature = signature || '',
      soul_birth = birth || '';

    // soul_user_info
    const updateBasicInfo = avatar
      ? format('update soul_user_info set soul_avatar = ?, soul_signature = ?, soul_birth = ? where soul_uuid = ?', [
          avatar,
          soul_signature,
          soul_birth,
          soul_uuid,
        ])
      : format('update soul_user_info set soul_signature = ?, soul_birth = ? where soul_uuid = ?', [
          soul_signature,
          soul_birth,
          soul_uuid,
        ]);

    const updateTbFriend = format('update tb_friend set friend_avatar = ? where friend_id = ?', [avatar, soul_uuid]);
    const updateTbPrivateChat = format('update tb_private_chat set sender_avatar = ? where sender_id = ?', [
      avatar,
      soul_uuid,
    ]);
    const updateTbRoomChat = format('update tb_room_chat set sender_avatar = ? where sender_id = ?', [
      avatar,
      soul_uuid,
    ]);
    const updateTbRoomMember = format('update room_member set member_avatar = ? where member_id = ?', [
      avatar,
      soul_uuid,
    ]);

    await query(updateBasicInfo);

    if (avatar) {
      await Promise.all([
        query(updateTbFriend),
        query(updateTbPrivateChat),
        query(updateTbRoomChat),
        query(updateTbRoomMember),
        batchSetSessionsAvatar(soul_uuid, avatar),
      ]);
    }
    return res.status(200).json({
      code: 0,
      data: {
        avatar,
      },
      msg: 'success update basic info',
    });
  } catch (e: any) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

import { Request, Response } from 'express';
import { UserInfo } from '../../../type/type';
import { hasPermission } from '../../../utils/hasPermission';
import { query } from '../../../utils/query';
import { UnSuccessCodeType } from '../code-type';
import { format, escape } from 'sqlstring';
import dayjs from 'dayjs';

const { noPermission, invalidUuid, alreadyAddFriend } = UnSuccessCodeType;

// 添加好友
export async function addFriend(req: Request, res: Response) {
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

    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({
        code: invalidUuid,
        data: {},
        msg: 'invalid uid',
      });
    }

    const getUserInfo = `select * from soul_user_info where soul_uuid = ${escape(friendId)}`;
    const getOwnInfo = `select * from soul_user_info where soul_uuid = ${escape(uuid)}`;
    const userInfo: UserInfo[] = await query(getUserInfo);
    const ownInfo: UserInfo[] = await query(getOwnInfo);
    if (userInfo.length !== 1 || ownInfo.length !== 1) {
      return res.status(400).json({
        code: invalidUuid,
        data: {},
        msg: 'invalid uid',
      });
    } else {
      const { soul_avatar, soul_username } = userInfo[0];
      const { soul_avatar: ownAvatar, soul_username: ownUsername } = ownInfo[0];
      const searchOwnRelation = format('select * from tb_friend where user_id = ? and friend_id = ?', [uuid, friendId]);
      const searchOtherRelation = format('select * from tb_friend where user_id = ? and friend_id = ?', [
        friendId,
        uuid,
      ]);
      const ownRelation = await query(searchOwnRelation);
      const otherRelation = await query(searchOtherRelation);

      if (ownRelation?.length || otherRelation?.length) {
        return res.status(200).json({
          code: alreadyAddFriend,
          data: {},
          msg: 'you have already added this user',
        });
      }

      const addFriend = soul_avatar
        ? format(
            'insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values (?, ?, ?, ?, ?)',
            [uuid, friendId, dayjs().unix(), soul_username, soul_avatar]
          )
        : format('insert into tb_friend (user_id, friend_id, add_time, friend_username) values (?, ?, ?, ?)', [
            uuid,
            friendId,
            dayjs().unix(),
            soul_username,
          ]);

      const addFriendByOther = ownAvatar
        ? format(
            'insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values (?, ?, ?, ?, ?)',
            [friendId, uuid, dayjs().unix(), ownUsername, ownAvatar]
          )
        : format('insert into tb_friend (user_id, friend_id, add_time, friend_username) values (?, ?, ?, ?)', [
            friendId,
            uuid,
            dayjs().unix(),
            ownUsername,
          ]);
      await query(addFriend);
      await query(addFriendByOther);

      return res.status(200).json({
        code: 0,
        data: {},
        msg: 'add friend success',
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

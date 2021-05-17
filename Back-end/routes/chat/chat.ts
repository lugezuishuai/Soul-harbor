import express from 'express';
import { ChatSearchRes, MsgInfo, ResUserInfo, SessionInfo, UserInfo } from '../../type/type';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { batchGetSessions, redisGet } from '../../utils/redis';
import { UnSuccessCodeType } from './code-type';
import dayjs from 'dayjs';

const router = express.Router();
const { alreadyAddFriend, invalidUid } = UnSuccessCodeType;

interface UnreadPrivateMsg {
  [key: string]: MsgInfo[];
}

interface FriendInfo {
  friend_id: string;
  friend_username: string;
  friend_avatar: string | null;
}

// 搜索用户
router.get('/search', async (req, res) => {
  try {
    let { search }: any = req.query;
    search = search.replace(/'|‘/g, '');
    const searchByUsernameOrEmail = `select * from soulUserInfo where binary soulUsername like '%${search}%' or binary soulEmail like '%${search}%'`;
    const result: UserInfo[] = await query(searchByUsernameOrEmail);

    const lastResult = result.length
      ? await Promise.all(
          result.map(async (user) => {
            const { soulUsername, soulEmail, soulUuid, soulSignature, soulAvatar, soulBirth } = user;
            const userId = soulUuid.slice(0, 8);

            const userInfo: ResUserInfo = {
              username: soulUsername,
              uid: soulUuid,
              email: soulEmail,
              signature: soulSignature,
              birth: soulBirth,
              avatar: soulAvatar,
            };

            const data: ChatSearchRes = {
              userInfo,
              online: false,
            };

            const reply = await redisGet(`socket_${userId}`);

            if (!isNullOrUndefined(reply)) {
              data.online = true;
            }

            return data;
          })
        )
      : [];

    const onlineUsers = lastResult.filter((user) => user.online);
    const offlineUsers = lastResult.filter((user) => !user.online);

    const searchedUsers = onlineUsers.concat(offlineUsers);

    return res.status(200).json({
      code: 0,
      data: searchedUsers,
      msg: 'search success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 查看是否有未读信息
router.get('/unread', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const searchUnreadMsg = `select * from tb_private_chat where receiver_id = '${uuid}' and type = 'offline' order by message_id asc`; // 按照message_id升序来排列
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
});

// 用户查看指定会话信息
router.get('/getHisMsg', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const { sessionId } = req.query; // roomId || uuid

    const searchMsg = `select * from tb_private_chat where (sender_id = '${uuid}' or sender_id = '${sessionId}') and (receiver_id = '${uuid}' or receiver_id = '${sessionId}') order by message_id asc`; // 按照message_id升序来排列

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
});

// 用户点击查看未读信息
router.post('/readUnreadMsg', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const { sessionId, type } = req.body; // roomId || uuid

    const updateUnreadMsg =
      type === 'private'
        ? `update tb_private_chat set type = 'online' where type = 'offline' and sender_id = '${sessionId}' and receiver_id = '${uuid}'`
        : `update tb_private_chat set type = 'online' where type = 'offline' and sender_id = '${sessionId}' and receiver_id = '${uuid}'`; // 这里还要改

    await query(updateUnreadMsg);

    return res.status(200).json({
      code: 0,
      data: {},
      msg: 'update success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 添加好友
router.post('/addFriend', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const { friendId } = req.body; // roomId || uuid

    const getUserInfo = `select * from soulUserInfo where soulUuid = '${friendId}'`;
    const userInfo: UserInfo[] = await query(getUserInfo);
    if (userInfo.length !== 1) {
      return res.status(400).json({
        code: invalidUid,
        data: {},
        msg: 'invalid uid',
      });
    } else {
      const { soulAvatar, soulUsername } = userInfo[0];
      const searchRelation = `select * from tb_friend where user_id = '${uuid}' and friend_id = '${friendId}'`;
      const result = await query(searchRelation);

      if (result && result.length) {
        return res.status(200).json({
          code: alreadyAddFriend,
          data: {},
          msg: 'you have already added this user',
        });
      }

      const addFriend = soulAvatar
        ? `insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soulUsername}', '${soulAvatar}')`
        : `insert into tb_friend (user_id, friend_id, add_time, friend_username) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soulUsername}')`;
      await query(addFriend);

      return res.status(200).json({
        code: 0,
        data: {},
        msg: 'add friend success',
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
});

// 拉取好友列表
router.get('/getFriendsList', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const searchFriends = `select friend_id, friend_username, friend_avatar from tb_friend where user_id = '${uuid}' order by add_time asc`; // 按照添加时间升序排列

    const friendsList: FriendInfo[] = await query(searchFriends);

    return res.status(200).json({
      code: 0,
      data: {
        friendsList,
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
});

// 拉取会话列表
router.get('/getSessionsList', async (req, res) => {
  const { uuid } = req.cookies;
  try {
    const sessionsList: SessionInfo[] = await batchGetSessions(uuid);

    return res.status(200).json({
      code: 0,
      data: {
        sessionsList,
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
});

export default router;

import express from 'express';
import { ChatSearchRes, MessageBody, MsgInfo, ResUserInfo, SessionInfo, UserInfo } from '../../type/type';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { batchGetSessions, redisGet, redisSet } from '../../utils/redis';
import { UnSuccessCodeType } from './code-type';
import dayjs from 'dayjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const { alreadyAddFriend, invalidUid, noPermission } = UnSuccessCodeType;

interface UnreadPrivateMsg {
  [key: string]: MsgInfo[];
}

interface FriendInfo {
  friend_id: string;
  friend_username: string;
  friend_avatar: string | null;
}

interface RobotChatReq {
  messageBody: MessageBody;
}

interface RobotChatRes {
  content: string;
  result: number;
}

interface MemberInfo {
  member_id: string;
  member_username: string;
  member_avatar: string | null;
  member_role: 0 | 1; // 0表示群主，1表示普通成员
}

interface NewGroupChatReq {
  members: MemberInfo[];
  room_name: string;
}

interface AddGroupMemberReq {
  members: MemberInfo[];
  room_id: string;
}

function batchInsertMembers(members: MemberInfo[], room_id: string) {
  const nowTime = dayjs().unix();
  let batchInsertMembers =
    'insert into room_member (room_id, room_name, member_id, member_username, member_avatar, member_role, join_time) values ';
  members.forEach((memberInfo, index) => {
    const { member_id, member_username, member_role } = memberInfo;
    let { member_avatar } = memberInfo;
    member_avatar = member_avatar || '';
    if (index !== members.length - 1) {
      batchInsertMembers += `('${room_id}', '${member_id}', '${member_username}', '${member_avatar}', ${member_role}, ${nowTime}), `;
    } else {
      batchInsertMembers += `('${room_id}', '${member_id}', '${member_username}', '${member_avatar}', ${member_role}, ${nowTime})`;
    }
  });

  return batchInsertMembers;
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
    const { friendId } = req.body;

    if (!uuid) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    if (!friendId) {
      return res.status(400).json({
        code: invalidUid,
        data: {},
        msg: 'invalid uid',
      });
    }

    const getUserInfo = `select * from soulUserInfo where soulUuid = '${friendId}'`;
    const getOwnInfo = `select * from soulUserInfo where soulUuid = '${uuid}'`;
    const userInfo: UserInfo[] = await query(getUserInfo);
    const ownInfo: UserInfo[] = await query(getOwnInfo);
    if (userInfo.length !== 1 || ownInfo.length !== 1) {
      return res.status(400).json({
        code: invalidUid,
        data: {},
        msg: 'invalid uid',
      });
    } else {
      const { soulAvatar, soulUsername } = userInfo[0];
      const { soulAvatar: ownAvatar, soulUsername: ownUsername } = ownInfo[0];
      const searchOwnRelation = `select * from tb_friend where user_id = '${uuid}' and friend_id = '${friendId}'`;
      const searchOtherRelation = `select * from tb_friend where user_id = '${friendId}' and friend_id = '${uuid}'`;
      const ownRelation = await query(searchOwnRelation);
      const otherRelation = await query(searchOtherRelation);

      if (ownRelation?.length || otherRelation?.length) {
        return res.status(200).json({
          code: alreadyAddFriend,
          data: {},
          msg: 'you have already added this user',
        });
      }

      const addFriend = soulAvatar
        ? `insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soulUsername}', '${soulAvatar}')`
        : `insert into tb_friend (user_id, friend_id, add_time, friend_username) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soulUsername}')`;

      const addFriendByOther = ownAvatar
        ? `insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values ('${friendId}', '${uuid}', ${dayjs().unix()}, '${ownUsername}', '${ownAvatar}')`
        : `insert into tb_friend (user_id, friend_id, add_time, friend_username) values ('${friendId}', '${uuid}', ${dayjs().unix()}, '${ownUsername}')`;
      await query(addFriend);
      await query(addFriendByOther);

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
  try {
    const { uuid } = req.cookies;
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

// 机器人聊天
router.post('/robotChat', async (req, res) => {
  try {
    const { messageBody }: RobotChatReq = req.body;
    const { sender_id, sender_avatar, receiver_id, message, message_id, time } = messageBody;

    // 判断会话是否存在
    let sessionInfo: SessionInfo | null = JSON.parse(await redisGet(`session_${sender_id}_${receiver_id}`));
    if (sessionInfo) {
      sessionInfo.latestTime = time;
      sessionInfo.latestMessage = message;
    } else {
      sessionInfo = {
        type: 'private',
        sessionId: receiver_id,
        owner_id: sender_id,
        latestTime: time,
        latestMessage: message,
        name: '机器人小X',
        avatar: null,
      };
    }

    redisSet(`session_${sender_id}_${receiver_id}`, JSON.stringify(sessionInfo));

    const sendMessage: MsgInfo = {
      sender_id,
      receiver_id,
      message,
      message_id,
      time: dayjs(time * 1000).format('h:mm a'),
      type: 'online',
      sender_avatar,
    };

    const insertSendMessage = sendMessage.sender_avatar
      ? `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', '${sendMessage.sender_avatar}')`
      : `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}')`;

    await query(insertSendMessage);

    const { data } = await axios({
      method: 'get',
      baseURL: 'http://api.qingyunke.com',
      url: encodeURI(`/api.php?key=free&appid=0&msg=${message}`),
    });

    const { content }: RobotChatRes = data;

    const nowTime = dayjs().unix();
    // 机器人回复的信息
    const replyMessage: MsgInfo = {
      sender_id: '0',
      receiver_id: sender_id,
      message: content,
      message_id: nowTime,
      time: dayjs(nowTime * 1000).format('h:mm a'),
      type: 'online',
      sender_avatar: null,
    };

    sessionInfo.latestTime = nowTime;
    sessionInfo.latestMessage = replyMessage.message;

    redisSet(`session_${sender_id}_${receiver_id}`, JSON.stringify(sessionInfo));

    const insertReplyMessage = `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message) values ('${replyMessage.sender_id}', '${replyMessage.receiver_id}', ${replyMessage.message_id}, '${replyMessage.type}', '${replyMessage.time}', '${replyMessage.message}')`;
    await query(insertReplyMessage);

    return res.status(200).json({
      code: 0,
      data: {
        message: replyMessage,
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

// 发起群聊
router.post('/newGroupChat', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const { members, room_name }: NewGroupChatReq = req.body;
    const room_id = uuidv4();

    const buildGroup = `insert into room_info (room_id, room_name, create_time, room_create_id) values ('${room_id}', '${room_name}', '${dayjs().format(
      'YYYY-MM-DD'
    )}', '${uuid}') `;
    await query(buildGroup);
    await query(batchInsertMembers(members, room_id));

    return res.status(200).json({
      code: 0,
      data: {},
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

// 添加群成员
router.post('/addGroupMembers', async (req, res) => {
  try {
    const { room_id, members }: AddGroupMemberReq = req.body;
    const addGroupMembers = batchInsertMembers(members, room_id);

    await query(addGroupMembers);

    return res.status(200).json({
      code: 0,
      data: {},
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

// 获取群列表
router.get('/getGroupsList', async (req, res) => {
  try {
    const { uuid } = req.cookies;
    const getGroupsId = `select room_id from room_member where member_id = '${uuid}'`;

    const result: { room_id: string[] } = await query(getGroupsId);

    if (!result?.room_id || !result.room_id.length) {
      return res.status(200).json({
        code: 0,
        data: {
          rooms: [],
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
});

export default router;

import express from 'express';
import { ChatSearchRes, MessageBody, MsgInfo, ResUserInfo, RoomInfo, SessionInfo, UserInfo } from '../../type/type';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { batchGetSessions, redisDel, redisGet, redisSet } from '../../utils/redis';
import { UnSuccessCodeType } from './code-type';
import dayjs from 'dayjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { hasPermission } from '../../utils/hasPermission';

const router = express.Router();
const { alreadyAddFriend, invalidUid, noPermission, clientError } = UnSuccessCodeType;

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

interface SearchMembersRes {
  room_id: string;
  room_name: string;
  room_avatar: string | null;
  member_username: string;
}

interface SearchContractsRoomInfo {
  room_id: string;
  room_name: string;
  room_avatar: string | null;
  member_username: string[];
}

interface SearchContractsRes {
  friends: FriendInfo[];
  rooms: SearchContractsRoomInfo[];
  keyword: string;
}

interface SearchChatRecord {
  sender_avatar: string | null;
  sender_id: string;
  sender_username: string;
  message: string;
  message_id: number;
  time: string; // YYYY/MM/DD
}

interface SearchFriendChatRecordSqlRes {
  sender_avatar: string | null;
  sender_id: string;
  soul_username: string;
  message: string;
  message_id: number;
}

interface SearchRobotChatRecordsSqlRes {
  sender_avatar: string | null;
  sender_id: string;
  message: string;
  message_id: number;
}

interface SearchChatRecordsRes {
  keyword: string;
  records: SearchChatRecord[];
}

function batchInsertMembers(members: MemberInfo[], room_id: string) {
  const nowTime = dayjs().unix();
  let batchInsertMembers =
    'insert into room_member (room_id, member_id, member_username, member_avatar, member_role, join_time) values ';
  members.forEach((memberInfo, index) => {
    const { member_id, member_username, member_role } = memberInfo;
    let { member_avatar } = memberInfo;
    member_avatar = member_avatar || '';
    if (index === members.length - 1) {
      batchInsertMembers += `('${room_id}', '${member_id}', '${member_username}', '${member_avatar}', ${member_role}, ${nowTime})`;
    } else {
      batchInsertMembers += `('${room_id}', '${member_id}', '${member_username}', '${member_avatar}', ${member_role}, ${nowTime}), `;
    }
  });

  return batchInsertMembers;
}

function batchSearchRoomInfo(roomIds: string[]) {
  let batchSearchRoomInfo = `select room_id, room_avatar, room_name from room_info where room_info.room_id in (`;
  roomIds.forEach((roomId, index) => {
    if (index === roomIds.length - 1) {
      batchSearchRoomInfo += `'${roomId}')`;
    } else {
      batchSearchRoomInfo += `'${roomId}', `;
    }
  });

  batchSearchRoomInfo += ' order by room_create_time asc'; // 按照群组创建时间升序排序

  return batchSearchRoomInfo;
}

function batchSearchRoomMembers(roomIds: string[], keyword: string, searcherId: string) {
  let batchSearchRoomMembers = `select room_member.member_username, room_info.room_id, room_info.room_name, room_info.room_avatar from room_member, room_info where room_member.member_username like '%${keyword}%' and room_member.member_id <> '${searcherId}' and room_info.room_id = room_member.room_id and room_info.room_id in (`;
  roomIds.forEach((roomId, index) => {
    if (index === roomIds.length - 1) {
      batchSearchRoomMembers += `'${roomId}')`;
    } else {
      batchSearchRoomMembers += `'${roomId}', `;
    }
  });

  batchSearchRoomMembers += ' order by room_info.room_create_time asc'; // 按照群组创建时间升序排序

  return batchSearchRoomMembers;
}

function wrapRoomMembers(searchMembersRes: SearchMembersRes[]): SearchContractsRoomInfo[] {
  const result: SearchContractsRoomInfo[] = [];
  searchMembersRes.forEach((item) => {
    if (!result.length) {
      result.push({
        room_id: item.room_id,
        room_name: item.room_name,
        room_avatar: item.room_avatar,
        member_username: [item.member_username],
      });
    } else {
      let target: SearchContractsRoomInfo | undefined;
      for (const res of result) {
        if (res.room_id === item.room_id) {
          target = res;
          break;
        }
      }
      if (target) {
        target.member_username.push(item.member_username);
      } else {
        result.push({
          room_id: item.room_id,
          room_name: item.room_name,
          room_avatar: item.room_avatar,
          member_username: [item.member_username],
        });
      }
    }
  });

  return result;
}

// 搜索用户
router.get('/search', async (req, res) => {
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
    let { keyword }: any = req.query;
    keyword = keyword.replace(/'|‘/g, '');
    const searchByUsernameOrEmail = `select * from soul_user_info where binary soul_username like '%${keyword}%' or binary soul_email like '%${keyword}%'`;
    const result: UserInfo[] = await query(searchByUsernameOrEmail);

    const lastResult = result.length
      ? await Promise.all(
          result.map(async (user) => {
            const { soul_username, soul_email, soul_uuid, soul_signature, soul_avatar, soul_birth } = user;
            const userId = soul_uuid.slice(0, 8);

            const userInfo: ResUserInfo = {
              username: soul_username,
              uid: soul_uuid,
              email: soul_email,
              signature: soul_signature,
              birth: soul_birth,
              avatar: soul_avatar,
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
    const resData = {
      keyword,
      membersInfo: searchedUsers,
    };

    return res.status(200).json({
      code: 0,
      data: resData,
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

// 根据关键字搜索聊天记录
router.get('/searchChatRecords', async (req, res) => {
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

    const { sessionId }: any = req.query;
    if (!sessionId) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client Error',
      });
    }
    let { keyword }: any = req.query;
    keyword = keyword.replace(/'|‘/g, '');

    const searchChatRecordsRes: SearchChatRecordsRes = {
      records: [],
      keyword,
    };
    const searchFriendChatRecordsSql = `select soul_user_info.soul_username, tb_private_chat.sender_id, tb_private_chat.sender_avatar, tb_private_chat.message, tb_private_chat.message_id from soul_user_info, tb_private_chat where (tb_private_chat.sender_id = '${sessionId}' or tb_private_chat.sender_id = '${uuid}') and (tb_private_chat.receiver_id = '${sessionId}' or tb_private_chat.receiver_id = '${uuid}') and soul_user_info.soul_uuid = tb_private_chat.sender_id and binary tb_private_chat.message like '%${keyword}%' order by tb_private_chat.message_id desc`; // 按照message_id降序来排列
    const searchRobotChatRecordsSql = `select sender_avatar, sender_id, message, message_id from tb_private_chat where (sender_id = '${sessionId}' or sender_id = '${uuid}') and (receiver_id = '${sessionId}' or receiver_id = '${uuid}') and binary message like '%${keyword}%' order by message_id desc`; // 按照message_id降序排列

    if (sessionId !== '0') {
      const result: SearchFriendChatRecordSqlRes[] = await query(searchFriendChatRecordsSql);
      if (result?.length) {
        searchChatRecordsRes.records = result.map((item) => {
          const { sender_avatar, sender_id, soul_username, message, message_id } = item;
          return {
            sender_avatar,
            sender_id,
            sender_username: soul_username,
            message,
            message_id,
            time: dayjs(message_id * 1000).format('YYYY/MM/DD'),
          };
        });
      }
    } else {
      const result: SearchRobotChatRecordsSqlRes[] = await query(searchRobotChatRecordsSql);
      if (result?.length) {
        searchChatRecordsRes.records = result.map((item) => {
          const { sender_avatar, sender_id, message, message_id } = item;
          return {
            sender_avatar,
            sender_id,
            sender_username: '机器人小X',
            message,
            message_id,
            time: dayjs(message_id * 1000).format('YYYY/MM/DD'),
          };
        });
      }
    }

    return res.status(200).json({
      code: 0,
      data: searchChatRecordsRes,
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

// 根据关键字搜索用户和群组
router.get('/searchContracts', async (req, res) => {
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

    let { keyword }: any = req.query;
    keyword = keyword.replace(/'|‘/g, '');

    const searchContractsRes: SearchContractsRes = {
      friends: [],
      rooms: [],
      keyword,
    };
    const searchFriends = `select friend_id, friend_username, friend_avatar from tb_friend where user_id = '${uuid}' and binary friend_username like '%${keyword}%' order by add_time asc`; // 按照add_time升序来排列
    const friendsInfo: FriendInfo[] = await query(searchFriends);

    if (friendsInfo?.length) {
      searchContractsRes.friends = friendsInfo;
    }

    const getGroupsId = `select room_id from room_member where member_id = '${uuid}'`;

    const getGroupsIdRes: { room_id: string }[] = await query(getGroupsId);

    if (getGroupsIdRes?.length) {
      const roomIds = getGroupsIdRes.map((item) => item.room_id);
      const searchMembersRes: SearchMembersRes[] = await query(batchSearchRoomMembers(roomIds, keyword, uuid));
      searchContractsRes.rooms = wrapRoomMembers(searchMembersRes);
    }

    return res.status(200).json({
      code: 0,
      data: searchContractsRes,
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

// 查看是否有未读信息
router.get('/unread', async (req, res) => {
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
});

// 用户点击查看未读信息
router.post('/readUnreadMsg', async (req, res) => {
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
        code: invalidUid,
        data: {},
        msg: 'invalid uid',
      });
    }

    const getUserInfo = `select * from soul_user_info where soul_uuid = '${friendId}'`;
    const getOwnInfo = `select * from soul_user_info where soul_uuid = '${uuid}'`;
    const userInfo: UserInfo[] = await query(getUserInfo);
    const ownInfo: UserInfo[] = await query(getOwnInfo);
    if (userInfo.length !== 1 || ownInfo.length !== 1) {
      return res.status(400).json({
        code: invalidUid,
        data: {},
        msg: 'invalid uid',
      });
    } else {
      const { soul_avatar, soul_username } = userInfo[0];
      const { soul_avatar: ownAvatar, soul_username: ownUsername } = ownInfo[0];
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

      const addFriend = soul_avatar
        ? `insert into tb_friend (user_id, friend_id, add_time, friend_username, friend_avatar) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soul_username}', '${soul_avatar}')`
        : `insert into tb_friend (user_id, friend_id, add_time, friend_username) values ('${uuid}', '${friendId}', ${dayjs().unix()}, '${soul_username}')`;

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

// 删除好友
router.post('/deleteFriend', async (req, res) => {
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

    const searchFriend = `select * from tb_friend where user_id = '${uuid}' and friend_id = '${friendId}'`;
    const searchOtherFriend = `select * from tb_friend where user_id = '${friendId}' and friend_id = '${uuid}'`;

    const result: any[] = await Promise.all([query(searchFriend), query(searchOtherFriend)]);

    if (result.length !== 2) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client error',
      });
    } else if (result[0].length !== 1 || result[1].length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client error',
      });
    } else {
      // 验证通过，两人互为好友
      const deleteFriend = `delete from tb_friend where (user_id = '${uuid}' or user_id = '${friendId}') and (friend_id = '${uuid}' or friend_id = '${friendId}')`;
      await query(deleteFriend);

      const ownSession = await redisGet(`session_${uuid}_${friendId}`);
      const otherSession = await redisGet(`session_${friendId}_${uuid}`);

      if (ownSession) {
        redisDel(`session_${uuid}_${friendId}`);
      }

      if (otherSession) {
        redisDel(`session_${friendId}_${uuid}`);
      }

      return res.status(200).json({
        code: 0,
        data: {},
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

// 拉取好友列表
router.get('/getFriendsList', async (req, res) => {
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
    // @ts-ignore
    const { token } = req.session;
    if (!(await hasPermission(uuid, token))) {
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
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 拉取某个会话信息
router.get('/getSessionInfo', async (req, res) => {
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
});

// 机器人聊天
router.post('/robotChat', async (req, res) => {
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
    const prevTime = dayjs().unix();
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
      private_chat: 0,
    };

    const insertSendMessage = sendMessage.sender_avatar
      ? `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', '${sendMessage.sender_avatar}', 0)`
      : `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', 0)`;

    await query(insertSendMessage);

    const { data } = await axios({
      method: 'get',
      baseURL: 'http://api.qingyunke.com',
      url: encodeURI(`/api.php?key=free&appid=0&msg=${message}`),
    });

    const { content }: RobotChatRes = data;

    const nextTime = dayjs().unix();
    const nowTImeForClient = time + (nextTime - prevTime); // 客户端此时的时间
    // 机器人回复的信息
    const replyMessage: MsgInfo = {
      sender_id: '0',
      receiver_id: sender_id,
      message: content,
      message_id: nowTImeForClient,
      time: dayjs(nowTImeForClient * 1000).format('h:mm a'),
      type: 'online',
      sender_avatar: null,
      private_chat: 0,
    };

    sessionInfo.latestTime = nowTImeForClient;
    sessionInfo.latestMessage = replyMessage.message;

    redisSet(`session_${sender_id}_${receiver_id}`, JSON.stringify(sessionInfo));

    const insertReplyMessage = `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values ('${replyMessage.sender_id}', '${replyMessage.receiver_id}', ${replyMessage.message_id}, '${replyMessage.type}', '${replyMessage.time}', '${replyMessage.message}', 0)`;
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
    // @ts-ignore
    const { token } = req.session;
    if (!(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    const { members, room_name }: NewGroupChatReq = req.body;
    const room_id = uuidv4();

    const buildGroup = `insert into room_info (room_id, room_name, room_create_time, room_create_id) values ('${room_id}', '${room_name}', ${dayjs().unix()}, '${uuid}') `;
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

    const searchOldMemberIds = `select member_id from room_member where room_id = '${room_id}'`;
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
    // @ts-ignore
    const { token } = req.session;
    if (!(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    const getGroupsId = `select room_id from room_member where member_id = '${uuid}'`;

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
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

// 获取群成员列表
router.get('/getGroupMembers', async (req, res) => {
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
    const { room_id } = req.query;
    const getGroupMembers = `select member_id, member_username, member_avatar, member_role from room_member where room_member.room_id = '${room_id}' order by join_time asc`; // 按照入群时间排序
    const result: MemberInfo[] = await query(getGroupMembers);

    if (!result?.length) {
      return res.status(200).json({
        code: 0,
        data: {
          members: [],
        },
        msg: 'success',
      });
    }

    return res.status(200).json({
      code: 0,
      data: {
        members: result,
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

// 退出群聊
router.post('/exitGroup', async (req, res) => {
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

    const { room_id } = req.body;
    const searchMember = `select * from room_member where room_id = '${room_id}' and member_id = '${uuid}'`;
    const result = await query(searchMember);

    if (!result || result.length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'invalid uuid or invalid room_id',
      });
    }

    const exitGroup = `delete from room_member where room_id = '${room_id}' and member_id = '${uuid}'`;
    await query(exitGroup);

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

// 删除群成员
router.post('/deleteMember', async (req, res) => {
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

    const { member_id, room_id } = req.body;

    // 判断有没有删除群成员的权限
    const hasAbility = `select * from room_member where member_id = '${uuid}' and room_id = '${room_id}' and member_role = 0`;
    const result = await query(hasAbility);

    if (!result) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    } else if (result.length !== 1) {
      return res.status(400).json({
        code: clientError,
        data: {},
        msg: 'client Error',
      });
    } else {
      const deleteMember = `delete from room_member where member_id = '${member_id}' and room_id = '${room_id}'`;
      await query(deleteMember);

      return res.status(200).json({
        code: 0,
        data: {},
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

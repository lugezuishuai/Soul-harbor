import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import os from 'os';
import { getIPAddress } from '../../utils/getIPAddress';
import { redisDel, redisGet, redisSet } from '../../utils/redis';
import dayjs from 'dayjs';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import { query } from '../../utils/query';
import { UserInfo, SessionInfo, MsgInfo, MessageBody, RoomInfo } from '../../type/type';
import cookie from 'cookie';
import dotenv from 'dotenv';
import { stringifySessionInfo } from '../../helpers/fastJson';
dotenv.config({ path: '.env' });

export function createSocketIo(server: HttpServer) {
  const corsOrigin = `http://${process.env.SERVICE_IP || getIPAddress(os.networkInterfaces())}:${
    process.env.FRONT_END_PORT || 5000
  }`;
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
    },
  });

  io.on('connection', (socket: Socket) => {
    let uuid = '';
    if (socket.request.headers.cookie && cookie.parse(socket.request.headers.cookie)) {
      uuid = cookie.parse(socket.request.headers.cookie).uuid;
    }

    // 用户登录
    socket.on('login', (userId: string) => {
      redisSet(`socket_${userId}`, socket.id);
    });

    // 私聊信息
    socket.on('private message', async (messageBody: MessageBody) => {
      try {
        const { sender_id, sender_avatar, receiver_id, message, message_id, time } = messageBody;
        const searchUserInfoReceive = `select * from soul_user_info where soul_uuid = '${receiver_id}'`;
        const searchUserInfoSend = `select * from soul_user_info where soul_uuid = '${sender_id}'`;

        // 判断会话是否存在
        let sessionInfo_send: SessionInfo | null = JSON.parse(await redisGet(`session_${sender_id}_${receiver_id}`));
        let sessionInfo_receive: SessionInfo | null = JSON.parse(await redisGet(`session_${receiver_id}_${sender_id}`));

        if (sessionInfo_send && sessionInfo_receive) {
          sessionInfo_send.latestTime = time;
          sessionInfo_send.latestMessage = message;
          sessionInfo_receive.latestTime = time;
          sessionInfo_receive.latestMessage = message;
        } else if (sessionInfo_send) {
          const userInfo: UserInfo[] = await query(searchUserInfoReceive);

          if (!userInfo || userInfo.length !== 1) {
            return;
          }
          const { soul_username, soul_avatar } = userInfo[0];

          // 自己是发送信息的人
          sessionInfo_send = {
            type: 'private',
            sessionId: receiver_id,
            ownId: sender_id,
            latestTime: time,
            latestMessage: message,
            name: soul_username,
            avatar: soul_avatar,
          };
        } else if (sessionInfo_receive) {
          const userInfo: UserInfo[] = await query(searchUserInfoSend);

          if (!userInfo || userInfo.length !== 1) {
            return;
          }
          const { soul_username, soul_avatar } = userInfo[0];

          // 自己是接收信息的人
          sessionInfo_receive = {
            type: 'private',
            sessionId: sender_id,
            ownId: receiver_id,
            latestTime: time,
            latestMessage: message,
            name: soul_username,
            avatar: soul_avatar,
          };
        } else {
          const userInfoReceive: UserInfo[] = await query(searchUserInfoReceive);
          const userInfoSend: UserInfo[] = await query(searchUserInfoSend);

          if (!userInfoReceive || !userInfoSend || userInfoReceive.length !== 1 || userInfoSend.length !== 1) {
            return;
          }

          // 自己是发送信息的人
          sessionInfo_send = {
            type: 'private',
            sessionId: receiver_id,
            ownId: sender_id,
            latestTime: time,
            latestMessage: message,
            name: userInfoReceive[0].soul_username,
            avatar: userInfoReceive[0].soul_avatar,
          };

          // 自己是接收信息的人
          sessionInfo_receive = {
            type: 'private',
            sessionId: sender_id,
            ownId: receiver_id,
            latestTime: time,
            latestMessage: message,
            name: userInfoSend[0].soul_username,
            avatar: userInfoSend[0].soul_avatar,
          };
        }

        sessionInfo_send && redisSet(`session_${sender_id}_${receiver_id}`, stringifySessionInfo(sessionInfo_send));
        sessionInfo_receive &&
          redisSet(`session_${receiver_id}_${sender_id}`, stringifySessionInfo(sessionInfo_receive));

        // 根据receiver_id获取socketId, 判断用户是否在线
        const socketId = await redisGet(`socket_${receiver_id.slice(0, 8)}`);
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
        if (isNullOrUndefined(socketId)) {
          // 如果用户不在线
          sendMessage.type = 'offline';
        } else {
          io.to(socketId).emit('receive message', sendMessage); // 发送给对方
        }

        // TODO: 这里还需要去校验信息是否发送成功

        socket.emit('send message success', sendMessage); // 发送给自己
        const insertMessage = sendMessage.sender_avatar
          ? `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', '${sendMessage.sender_avatar}', 0)`
          : `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', 0)`;
        await query(insertMessage);
      } catch (e: any) {
        console.error(e);
      }
    });

    // 加入聊天室
    socket.on('join room', (roomIds: string[]) => {
      if (roomIds && roomIds.length > 0) {
        roomIds.forEach((room_id) => {
          socket.join(room_id);
        });
      }
    });

    // 更新好友
    socket.on('update friend', async (uuid: string, friend_id: string, username: string, type: 'add' | 'delete') => {
      try {
        const socketId = await redisGet(`socket_${friend_id.slice(0, 8)}`);

        if (!isNullOrUndefined(socketId)) {
          // 用户在线
          if (type === 'add') {
            io.to(socketId).emit('add friend', { msg: `您被 ${username} 添加为好友`, uuid });
          } else {
            io.to(socketId).emit('delete friend', { msg: `您被 ${username} 删除好友`, uuid });
          }
        }
      } catch (e: any) {
        console.error(e);
      }
    });

    // 群聊信息
    socket.on('room message', async (messageBody: MessageBody) => {
      try {
        const { sender_id, sender_avatar, receiver_id, message, message_id, time } = messageBody;
        const searchRoomInfo = `select room_id, room_name, room_avatar from room_info where room_id = '${receiver_id}'`;

        // 判断会话是否存在
        let sessionInfo: SessionInfo | null = JSON.parse(await redisGet(`room_session_${receiver_id}`));
        if (sessionInfo) {
          sessionInfo.latestTime = time;
          sessionInfo.latestMessage = message;
        } else {
          const result: RoomInfo[] = await query(searchRoomInfo);

          if (!result || result.length !== 1) {
            return;
          }

          const { room_name, room_avatar } = result[0];
          sessionInfo = {
            type: 'room',
            sessionId: receiver_id,
            name: room_name,
            avatar: room_avatar,
            latestTime: time,
            latestMessage: message,
          };
        }
        redisSet(`room_session_${receiver_id}`, stringifySessionInfo(sessionInfo)); // 设置会话

        const sendMessage: MsgInfo = {
          sender_id,
          receiver_id,
          message,
          message_id,
          time: dayjs(time * 1000).format('h:mm a'),
          type: 'online',
          sender_avatar,
          private_chat: 1,
        };

        io.to(receiver_id).emit('receive message', sendMessage); // 发送给该房间的所有在线用户

        const insertMessage = sendMessage.sender_avatar
          ? `insert into tb_room_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', '${sendMessage.sender_avatar}', 1)`
          : `insert into tb_room_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', 1)`;
        await query(insertMessage);
      } catch (e: any) {
        console.error(e);
      }
    });

    // socket断开连接
    socket.on('disconnect', async (reason) => {
      console.log('断开了连接', reason);

      if (uuid) {
        redisDel(`socket_${uuid.slice(0, 8)}`); // 删除掉用户在线标记

        const searchRoomIds = `select room_id from room_member where member_id = '${uuid}'`;
        const result: { room_id: string }[] = await query(searchRoomIds);

        if (result && result.length > 0) {
          const roomIds = result.map((roomInfo) => roomInfo.room_id);
          // 断开所有房间的socket连接
          roomIds.forEach((room_id) => socket.leave(room_id));
        }
      }
    });
  });
}

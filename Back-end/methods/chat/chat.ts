import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import os from 'os';
import { getIPAddress } from '../../utils/getIPAddress';
import { formatMessage, getCurrentUser, getRoomUsers, userJoin, userLeave } from './helpers';
import { redisDel, redisGet, redisSet } from '../../utils/redis';
import dayjs from 'dayjs';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { UserInfo, SessionInfo, MsgInfo, MessageBody } from '../../type/type';

interface JoinRoom {
  username: string;
  room: string;
}

export function createSocketIo(server: HttpServer) {
  const corsOrigin = `http://${getIPAddress(os.networkInterfaces()) || 'localhost'}:5000`;
  const io = new Server(server, {
    cors: {
      origin: `http://localhost:5000`, // 后续这里还要修改
    },
  });

  io.of('/chat').on('connection', (socket: Socket) => {
    // 用户登录
    socket.on('login', (userId: string) => {
      redisSet(`socket_${userId}`, socket.id);
    });

    // 私聊
    socket.on('private message', async (messageBody: MessageBody) => {
      try {
        const { sender_id, sender_avatar, receiver_id, message, message_id, time } = messageBody;
        const searchUserInfoReceive = `select * from soulUserInfo where soulUuid = '${receiver_id}'`;
        const searchUserInfoSend = `select * from soulUserInfo where soulUuid = '${sender_id}'`;

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
          const { soulUsername, soulAvatar } = userInfo[0];

          // 自己是发送信息的人
          sessionInfo_send = {
            type: 'private',
            sessionId: receiver_id,
            owner_id: sender_id,
            latestTime: time,
            latestMessage: message,
            name: soulUsername,
            avatar: soulAvatar,
          };
        } else if (sessionInfo_receive) {
          const userInfo: UserInfo[] = await query(searchUserInfoSend);

          if (!userInfo || userInfo.length !== 1) {
            return;
          }
          const { soulUsername, soulAvatar } = userInfo[0];

          // 自己是接收信息的人
          sessionInfo_receive = {
            type: 'private',
            sessionId: sender_id,
            owner_id: receiver_id,
            latestTime: time,
            latestMessage: message,
            name: soulUsername,
            avatar: soulAvatar,
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
            owner_id: sender_id,
            latestTime: time,
            latestMessage: message,
            name: userInfoReceive[0].soulUsername,
            avatar: userInfoReceive[0].soulAvatar,
          };

          // 自己是接收信息的人
          sessionInfo_receive = {
            type: 'private',
            sessionId: sender_id,
            owner_id: receiver_id,
            latestTime: time,
            latestMessage: message,
            name: userInfoSend[0].soulUsername,
            avatar: userInfoSend[0].soulAvatar,
          };
        }

        redisSet(`session_${sender_id}_${receiver_id}`, JSON.stringify(sessionInfo_send));
        redisSet(`session_${receiver_id}_${sender_id}`, JSON.stringify(sessionInfo_receive));

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
        };
        if (isNullOrUndefined(socketId)) {
          // 如果用户不在线
          sendMessage.type = 'offline';
        } else {
          io.of('/chat').to(socketId).emit('receive message', sendMessage); // 发送给对方
        }
        const insertMessage = sendMessage.sender_avatar
          ? `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}', '${sendMessage.sender_avatar}')`
          : `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}')`;
        await query(insertMessage);
      } catch (e) {
        console.error(e);
      }
    });

    // 加入聊天室
    socket.on('join room', ({ username, room }: JoinRoom) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      // 欢迎当前加入的用户(该用户)
      socket.emit('message', formatMessage(user.room, `Welcome to ${user.room}`));

      // 当一个用户连接的时候广播给该房间的其他用户(除该用户)
      socket.broadcast.to(user.room).emit('message', formatMessage(user.room, `${user.username} has joined the chat`));

      // 发送该房间的用户信息(该房间的所有用户)
      io.of('/chat')
        .to(user.room)
        .emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room),
        });
    });

    // 监听聊天信息
    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);

      user && io.of('/chat').to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // 关闭
    socket.on('close', (userId: string) => {
      console.log('来到了这里');
      redisDel(`socket_${userId}`);
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      const user = userLeave(socket.id);

      if (user) {
        socket.broadcast.to(user.room).emit('message', formatMessage(user.room, `${user.username} has left the chat`));

        // 发送该房间的用户信息(除该用户)
        socket.broadcast.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
}

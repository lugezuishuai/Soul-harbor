import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import os from 'os';
import { getIPAddress } from '../../utils/getIPAddress';
import { formatMessage, getCurrentUser, getRoomUsers, userJoin, userLeave } from './helpers';
import { redisDel, redisGet, redisSet } from '../../utils/redis';
import dayjs from 'dayjs';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { UserInfo, SessionInfo } from '../../type/type';

interface JoinRoom {
  username: string;
  room: string;
}

interface MessageBody {
  sender_id: string;
  receiver_id: string;
  message_id: number;
  message: string;
  time: number; // 秒为单位的时间戳
  type: 'private' | 'room'; // 私聊信息还是群聊信息
}

interface SendMessageBody {
  sender_id: string; // uuid
  receiver_id: string; // uuid
  message_id: number; // 递增
  message: string;
  time: string;
  type: 'online' | 'offline'; // 是否是离线信息
  sender_avatar: string | null; // 发送者头像
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
        const { sender_id, receiver_id, message, message_id, time, type } = messageBody;
        const searchUserInfo = `select * from soulUserInfo where soulUuid = '${receiver_id}'`;
        const userInfo: UserInfo[] = await query(searchUserInfo);

        if (!userInfo || userInfo.length !== 1) {
          return;
        }
        const { soulUsername, soulAvatar } = userInfo[0];

        // 判断会话是否存在
        let sessionInfo: SessionInfo | null = JSON.parse(await redisGet(`session_${sender_id}_${receiver_id}`));
        if (sessionInfo) {
          sessionInfo.latestTime = time;
        } else {
          if (type === 'private') {
            // 如果是私聊信息
            sessionInfo = {
              type: 'private',
              sessionId: receiver_id,
              latestTime: time,
              name: soulUsername,
              avatar: soulAvatar,
            };
          } else {
            // 如果是群聊，还要补充
          }
        }
        redisSet(`session_${sender_id}_${receiver_id}`, JSON.stringify(sessionInfo));

        // 根据receiver_id获取socketId, 判断用户是否在线
        const socketId = await redisGet(`socket_${receiver_id.slice(0, 8)}`);
        const sendMessage: SendMessageBody = {
          sender_id,
          receiver_id,
          message,
          message_id,
          time: dayjs(time * 1000).format('YYYY-MM-DD h:mm a'),
          type: 'online',
          sender_avatar: soulAvatar,
        };
        if (isNullOrUndefined(socketId)) {
          // 如果用户不在线
          sendMessage.type = 'offline';
        }
        const insertMessage = `insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message) values ('${sendMessage.sender_id}', '${sendMessage.receiver_id}', ${sendMessage.message_id}, '${sendMessage.type}', '${sendMessage.time}', '${sendMessage.message}')`;
        await query(insertMessage);

        io.of('/chat').to(socketId).emit('receive message', sendMessage); // 发送给对方
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

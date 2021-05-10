import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import os from 'os';
import { getIPAddress } from '../../utils/getIPAddress';
import { formatMessage, getCurrentUser, getRoomUsers, userJoin, userLeave } from './helpers';
import { redisDel, redisGet, redisSet } from '../../utils/redis';
import dayjs from 'dayjs';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';

interface JoinRoom {
  username: string;
  room: string;
}

interface MessageBody {
  senderId: string;
  receiveId: string;
  message: string;
  messageId: number;
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
      const { senderId, receiveId, message, messageId } = messageBody;
      // 根据receiveId获取socketId
      const socketId = await redisGet(`socket_${receiveId.slice(0, 8)}`);
      if (!isNullOrUndefined(socketId)) {
        io.of('/chat')
          .to(socketId)
          .emit('receive message', {
            senderId, // uuid
            receiveId, // uuid
            message,
            messageId,
            time: dayjs().format('h:mm a'),
            readMessageId: 0, // 默认0是未读信息，由前端去控制信息已读未读
          });
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

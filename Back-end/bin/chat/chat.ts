import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import os from 'os';
import { getIPAddress } from '../../utils/getIPAddress';
import { formatMessage, getCurrentUser, getRoomUsers, userJoin, userLeave } from './helpers';

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

    // 离开聊天室
    socket.on('disconnect', () => {
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

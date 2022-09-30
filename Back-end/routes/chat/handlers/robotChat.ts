import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import dayjs from 'dayjs';
import { MessageBody, MsgInfo, SessionInfo } from '../../../type/type';
import { redisGet, redisSet } from '../../../utils/redis';
import { stringifySessionInfo } from '../../../helpers/fastJson';
import { query } from '../../../utils/query';
import axios from 'axios';
import { format } from 'sqlstring';
import { UnSuccessCodeType } from '../code-type';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

interface RobotChatReq {
  messageBody: MessageBody;
}

interface RobotChatRes {
  content: string;
  result: number;
}

// 机器人聊天
export async function robotChat(req: Request, res: Response) {
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
        ownId: sender_id,
        latestTime: time,
        latestMessage: message,
        name: '机器人小X',
        avatar: null,
      };
    }

    redisSet(`session_${sender_id}_${receiver_id}`, stringifySessionInfo(sessionInfo));

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

    const {
      sender_avatar: senderAvatar,
      sender_id: senderId,
      receiver_id: receiverId,
      message_id: messageId,
      type: msgType,
      time: msgTime,
      message: messageContent,
    } = sendMessage;

    const insertSendMessage = senderAvatar
      ? format(
          'insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, sender_avatar, private_chat) values (?, ?, ?, ?, ?, ?, ?, ?)',
          [senderId, receiverId, messageId, msgType, msgTime, messageContent, senderAvatar, 0]
        )
      : format(
          'insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values (?, ?, ?, ?, ?, ?, ?)',
          [senderId, receiverId, messageId, msgType, msgTime, messageContent, 0]
        );

    await query(insertSendMessage);

    const { data } = await axios({
      method: 'get',
      baseURL: 'http://api.qingyunke.com',
      url: encodeURI(`/api.php?key=free&appid=0&msg=${message}`),
    });

    const { content }: RobotChatRes = data;

    const nextTime = dayjs().unix();
    const nowTimeForClient = time + (nextTime - prevTime); // 客户端此时的时间
    // 机器人回复的信息
    const replyMessage: MsgInfo = {
      sender_id: '0',
      receiver_id: sender_id,
      message: content,
      message_id: nowTimeForClient,
      time: dayjs(nowTimeForClient * 1000).format('h:mm a'),
      type: 'online',
      sender_avatar: null,
      private_chat: 0,
    };

    sessionInfo.latestTime = nowTimeForClient;
    sessionInfo.latestMessage = replyMessage.message;

    redisSet(`session_${sender_id}_${receiver_id}`, stringifySessionInfo(sessionInfo));

    const {
      sender_id: replySenderId,
      receiver_id: replyReceiverId,
      message_id: replyMessageId,
      type: replyMsgType,
      time: replyMsgTime,
      message: replyMessageContent,
    } = replyMessage;
    const insertReplyMessage = format(
      'insert into tb_private_chat (sender_id, receiver_id, message_id, type, time, message, private_chat) values (?, ?, ?, ?, ?, ?, ?)',
      [replySenderId, replyReceiverId, replyMessageId, replyMsgType, replyMsgTime, replyMessageContent, 0]
    );
    await query(insertReplyMessage);

    return res.status(200).json({
      code: 0,
      data: {
        message: replyMessage,
      },
      msg: 'success',
    });
  } catch (e: any) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

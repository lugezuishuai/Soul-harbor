import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { format } from 'sqlstring';
import { query } from '../../../utils/query';
import dayjs from 'dayjs';
import { isDevelopment } from '../../../config/constant';

const { noPermission, clientError } = UnSuccessCodeType;

interface SearchChatRecord {
  sender_avatar: string | null;
  sender_id: string;
  sender_username: string;
  message: string;
  message_id: number;
  time: string; // YYYY/MM/DD
}

interface SearchChatRecordsRes {
  keyword: string;
  records: SearchChatRecord[];
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

// 根据关键字搜索聊天记录
export async function searchChatRecords(req: Request, res: Response) {
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
    const searchFriendChatRecordsSql = format(
      'select soul_user_info.soul_username, tb_private_chat.sender_id, tb_private_chat.sender_avatar, tb_private_chat.message, tb_private_chat.message_id from soul_user_info, tb_private_chat where (tb_private_chat.sender_id = ? or tb_private_chat.sender_id = ?) and (tb_private_chat.receiver_id = ? or tb_private_chat.receiver_id = ?) and soul_user_info.soul_uuid = tb_private_chat.sender_id and binary tb_private_chat.message like ? order by tb_private_chat.message_id desc', // 按照message_id降序来排列
      [sessionId, uuid, sessionId, uuid, `%${keyword}%`]
    ); // 按照message_id降序来排列
    const searchRobotChatRecordsSql = format(
      'select sender_avatar, sender_id, message, message_id from tb_private_chat where (sender_id = ? or sender_id = ?) and (receiver_id = ? or receiver_id = ?) and binary message like ? order by message_id desc', // 按照message_id降序排列
      [sessionId, uuid, sessionId, uuid, `%${keyword}%`]
    ); // 按照message_id降序排列

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
  } catch (e: any) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

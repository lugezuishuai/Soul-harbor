import { Request, Response } from 'express';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { query } from '../../../utils/query';
import { FriendInfo } from '../../../type/type';
import { format, escape } from 'sqlstring';
import { isDevelopment } from '../../../config/constant';

const { noPermission } = UnSuccessCodeType;

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

function batchSearchRoomMembers(roomIds: string[], keyword: string, searcherId: string) {
  let batchSearchRoomMembers = format(
    'select room_member.member_username, room_info.room_id, room_info.room_name, room_info.room_avatar from room_member, room_info where room_member.member_username like ? and room_member.member_id <> ? and room_info.room_id = room_member.room_id and room_info.room_id in (',
    [`%${keyword}%`, searcherId]
  );
  roomIds.forEach((roomId, index) => {
    if (index === roomIds.length - 1) {
      batchSearchRoomMembers += `${escape(roomId)})`;
    } else {
      batchSearchRoomMembers += `${escape(roomId)}, `;
    }
  });

  batchSearchRoomMembers += ' order by room_info.room_create_time asc'; // 按照群组创建时间升序排序

  return batchSearchRoomMembers;
}

export async function searchContracts(req: Request, res: Response) {
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

    let { keyword }: any = req.query;
    keyword = keyword.replace(/'|‘/g, '');

    const searchContractsRes: SearchContractsRes = {
      friends: [],
      rooms: [],
      keyword,
    };
    const searchFriends = format(
      'select friend_id, friend_username, friend_avatar from tb_friend where user_id = ? and binary friend_username like ? order by add_time asc', // 按照add_time升序来排列
      [uuid, `%${keyword}%`]
    ); // 按照add_time升序来排列
    const friendsInfo: FriendInfo[] = await query(searchFriends);

    if (friendsInfo?.length) {
      searchContractsRes.friends = friendsInfo;
    }

    const getGroupsId = `select room_id from room_member where member_id = ${escape(uuid)}`;

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
  } catch (e: any) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}

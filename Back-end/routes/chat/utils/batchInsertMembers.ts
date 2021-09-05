import { MemberInfo } from '../../../type/type';
import dayjs from 'dayjs';
import { escape } from 'sqlstring';

export function batchInsertMembers(members: MemberInfo[], room_id: string) {
  const nowTime = dayjs().unix();
  let batchInsertMembers =
    'insert into room_member (room_id, member_id, member_username, member_avatar, member_role, join_time) values ';
  members.forEach((memberInfo, index) => {
    const { member_id, member_username, member_role } = memberInfo;
    let { member_avatar } = memberInfo;
    member_avatar = member_avatar || '';
    if (index === members.length - 1) {
      batchInsertMembers += `(${escape(room_id)}, ${escape(member_id)}, ${escape(member_username)}, ${escape(
        member_avatar
      )}, ${escape(member_role)}, ${escape(nowTime)})`;
    } else {
      batchInsertMembers += `(${escape(room_id)}, ${escape(member_id)}, ${escape(member_username)}, ${escape(
        member_avatar
      )}, ${escape(member_role)}, ${escape(nowTime)}), `;
    }
  });

  return batchInsertMembers;
}

import React from 'react';
import { MemberInfo } from '@/interface/chat/newGroupChat';
import defaultAvatar from '@/assets/image/default-avatar.png';
import Delete from '@/assets/icon/delete.svg';
import { Avatar, Icon, message, Modal } from 'antd';
import Cookie from 'js-cookie';
import { DeleteMemberReq } from '@/interface/chat/deleteMember';
import { apiPost } from '@/utils/request';
import { DELETE_GROUP_MEMBER } from '@/constants/urls';
import './index.less';

const { confirm } = Modal;

interface GroupMemberCardProps {
  getGroupMembers(): Promise<any>;
  memberInfo: MemberInfo;
  membersList: MemberInfo[];
  room_id: string;
  role?: 0 | 1;
}

export function GroupMemberCard({ memberInfo, role, room_id, getGroupMembers, membersList }: GroupMemberCardProps) {
  const { member_avatar, member_username, member_id, member_role } = memberInfo;

  // 删除群成员
  async function deleteMember() {
    try {
      const reqData: DeleteMemberReq = {
        room_id,
        member_id,
      };

      await apiPost(DELETE_GROUP_MEMBER, reqData);
      message.success('您已删除该成员');
      await getGroupMembers(); // 重新拉取一次群成员列表
    } catch (e) {
      console.error(e);
    }
  }

  function handleDeleteMember() {
    if (membersList.length > 3) {
      // 只有群人数大于3人才允许删除群成员
      confirm({
        title: '注意',
        content: `您确认要删除成员 ${member_username} 吗？`,
        centered: true,
        okText: '确认',
        cancelText: '取消',
        onOk: deleteMember,
      });
    } else {
      confirm({
        title: '注意',
        content: '抱歉，当前群人数小于4人，不允许删除群成员',
        centered: true,
        okText: '确认',
        cancelText: '取消',
      });
    }
  }

  return (
    <div className="group-member-card">
      <div className="group-member-card-content">
        <Avatar className="group-member-card-avatar" src={member_avatar || defaultAvatar} />
        <div className="group-member-card-name">{member_username}</div>
      </div>
      {member_role === 0 && <div className="group-member-card-label">群主</div>}
      {role === 0 && member_id !== Cookie.get('uuid') && (
        <Icon className="group-member-card-delete" component={Delete as any} onClick={handleDeleteMember} />
      )}
    </div>
  );
}

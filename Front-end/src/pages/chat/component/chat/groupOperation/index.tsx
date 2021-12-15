import React from 'react';
import { Button, Icon } from 'antd';
import { SelectSession } from '@/redux/reducers/state';
import AddMember from '@/assets/icon/add-member.svg';
import { GroupMemberCard } from '../../groupMemberCard';
import { useChat } from '../../../state';
import './index.less';

interface GroupOperationProps {
  handleAddMember(): Promise<void>;
  getGroupMembers(): Promise<void>;
  handleExitGroup(): void;
  selectSession: SelectSession;
}

export function GroupOperation({
  selectSession,
  handleAddMember,
  handleExitGroup,
  getGroupMembers,
}: GroupOperationProps) {
  const { membersList, getRole } = useChat();

  return (
    <>
      <div className="group-operation__content">
        <div className="group-operation__content__label">群聊名称</div>
        <div className="group-operation__content__text">{selectSession.name}</div>
        <div className="group-operation__content__label">群成员</div>
        <div className="group-operation__content__member">
          <div className="group-operation__content__member__add" onClick={handleAddMember}>
            <Icon className="group-operation__content__member__add__icon" component={AddMember as any} />
            <div className="group-operation__content__member__add__text">添加成员</div>
          </div>
          {membersList.length > 0 &&
            membersList.map((memberInfo, index) => (
              <GroupMemberCard
                key={index}
                memberInfo={memberInfo}
                role={getRole()}
                getGroupMembers={getGroupMembers}
                room_id={selectSession.sessionId}
                membersList={membersList}
              />
            ))}
        </div>
      </div>
      <Button type="danger" className="group-operation__btn" onClick={handleExitGroup}>
        退出群聊
      </Button>
    </>
  );
}

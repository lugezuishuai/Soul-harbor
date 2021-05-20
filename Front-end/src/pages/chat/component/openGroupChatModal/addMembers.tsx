import React, { useState } from 'react';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import Close from '@/assets/icon/close.svg';
import Form, { FormComponentProps } from 'antd/lib/form';
import { MemberSelect } from './memberSelect';
import { Button, Icon, message } from 'antd';
import { MemberInfo } from '@/interface/chat/newGroupChat';
import { AddGroupMembersReq } from '@/interface/chat/addGroupMembers';
import { apiPost } from '@/utils/request';
import { ADD_GROUP_MEMBERS } from '@/constants/urls';
import { openWidget } from '@/components/open-widget';
import './index.less';

interface AddMemberModalProps extends FormComponentProps {
  onCancel(): void;
  getGroupMembers(): Promise<any>;
  friendsList: FriendInfo[];
  selectedIds: string[];
  room_id: string;
}

interface FormValues {
  memberIds: string[];
}

function AddMemberModal({ form, friendsList, onCancel, selectedIds, room_id, getGroupMembers }: AddMemberModalProps) {
  const { getFieldDecorator, validateFields } = form;
  const [loading, setLoading] = useState(false);

  // 确认添加成员
  function handleSubmit() {
    validateFields(async (errors: Record<string, any>, values: FormValues) => {
      try {
        if (!errors) {
          const { memberIds } = values;
          const members: MemberInfo[] = [];
          setLoading(true);

          for (const id of memberIds) {
            const friendInfo = friendsList.find((friendInfo) => friendInfo.friend_id === id);
            if (!friendInfo) {
              continue;
            }

            const { friend_id, friend_username, friend_avatar } = friendInfo;
            members.push({
              member_id: friend_id,
              member_username: friend_username,
              member_avatar: friend_avatar,
              member_role: 1, // 普通群成员
            });
          }

          const reqData: AddGroupMembersReq = {
            members,
            room_id,
          };

          await apiPost(ADD_GROUP_MEMBERS, reqData);

          setLoading(false);
          onCancel();
          message.success('添加群成员成功');
          await getGroupMembers();
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
        onCancel();
      }
    });
  }

  return (
    <>
      <Form className="group-chat-modal-form">
        <Form.Item className="group-chat-modal-form__item">
          <div className="group-chat-modal-form-label">群聊人员</div>
          {getFieldDecorator('memberIds', {
            rules: [{ required: true, message: '请选择群聊人员' }],
          })(<MemberSelect friendsList={friendsList} selectedIds={selectedIds} />)}
        </Form.Item>
      </Form>
      <div className="group-chat-modal-footer">
        <Button
          className="group-chat-modal-footer-btn"
          type="primary"
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
        >
          确认
        </Button>
        <Button className="group-chat-modal-footer-btn" onClick={onCancel}>
          取消
        </Button>
      </div>
    </>
  );
}

const WrapAddMemberModal = Form.create<AddMemberModalProps>({
  name: 'add-member-modal',
})(AddMemberModal);

export async function addGroupMember(
  friendsList: FriendInfo[],
  selectedIds: string[],
  room_id: string,
  getGroupMembers: () => Promise<any>
) {
  const { hide } = await openWidget(
    {
      title: (
        <div className="group-chat-modal-title">
          <div className="group-chat-modal-title-text">添加群聊人员</div>
          <Icon className="group-chat-modal-title-icon" component={Close as any} onClick={() => hide()} />
        </div>
      ),
      className: 'group-chat-modal',
      width: 600,
      component: WrapAddMemberModal,
      componentProps: {
        friendsList,
        selectedIds,
        room_id,
        getGroupMembers,
        onCancel: () => hide(),
      },
      centered: true,
      closable: false,
      footer: null,
    },
    'modal'
  );
}

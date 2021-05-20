import React, { useState } from 'react';
import { Button, Form, Icon, Input, message } from 'antd';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import { openWidget } from '@/components/open-widget';
import Close from '@/assets/icon/close.svg';
import { FormComponentProps } from 'antd/lib/form';
import { MemberSelect } from './memberSelect';
import { MemberInfo, NewGroupChatReq } from '@/interface/chat/newGroupChat';
import { UserInfoState } from '@/redux/reducers/state';
import Cookie from 'js-cookie';
import { apiPost } from '@/utils/request';
import { NEW_GROUP_CHAT } from '@/constants/urls';
import { debounce } from 'lodash';
import './index.less';

interface ModalContentProps extends FormComponentProps {
  onCancel(): void;
  getGroupsList(): Promise<any>;
  friendsList: FriendInfo[];
  userInfo: UserInfoState;
}

interface FormValues {
  memberIds: string[];
  groupName: string;
}

function ModalContent({ form, friendsList, onCancel, userInfo, getGroupsList }: ModalContentProps) {
  const { getFieldDecorator, validateFields } = form;
  const [loading, setLoading] = useState(false);

  // 确认发起群聊
  function handleSubmit() {
    validateFields(async (errors: Record<string, any>, values: FormValues) => {
      if (!errors && userInfo) {
        const { memberIds, groupName } = values;
        if (memberIds.length < 2) {
          debounce(() => {
            message.destroy();
            message.error({
              content: '发起群聊至少要选择两名好友',
              key: 'build_group_chat_error',
              duration: 1,
            });
          }, 200)();
        } else {
          try {
            setLoading(true);
            const { username, avatar } = userInfo;
            const members: MemberInfo[] = [
              {
                member_id: Cookie.get('uuid') || '',
                member_avatar: avatar || null,
                member_username: username || '',
                member_role: 0, // 群主
              },
            ];
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

            const reqData: NewGroupChatReq = {
              members,
              room_name: groupName,
            };

            await apiPost(NEW_GROUP_CHAT, reqData);

            setLoading(false);
            onCancel();
            message.success('创建群聊成功');
            await getGroupsList(); // 重新拉取一遍群组列表
          } catch (e) {
            console.error(e);
            setLoading(false);
            onCancel();
          }
        }
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
          })(<MemberSelect friendsList={friendsList} />)}
        </Form.Item>
        <Form.Item className="group-chat-modal-form__item">
          <div className="group-chat-modal-form-label">群名称</div>
          {getFieldDecorator('groupName', {
            rules: [
              { required: true, message: '请填写群名称' },
              { max: 10, message: '群名称不能超过10个字符' },
            ],
          })(
            <Input
              className="group-chat-modal-form-input"
              placeholder="请输入群名称"
              allowClear={true}
              autoComplete="off"
            />
          )}
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

const WrapModalContent = Form.create<ModalContentProps>({
  name: 'modal-content',
})(ModalContent);

export async function openGroupChatModal(
  friendsList: FriendInfo[],
  userInfo: UserInfoState,
  getGroupsList: () => Promise<any>
) {
  const { hide } = await openWidget(
    {
      title: (
        <div className="group-chat-modal-title">
          <div className="group-chat-modal-title-text">选择群聊人员</div>
          <Icon className="group-chat-modal-title-icon" component={Close as any} onClick={() => hide()} />
        </div>
      ),
      className: 'group-chat-modal',
      width: 600,
      component: WrapModalContent,
      componentProps: {
        friendsList,
        userInfo,
        onCancel: () => hide(),
        getGroupsList,
      },
      centered: true,
      closable: false,
      footer: null,
    },
    'modal'
  );
}

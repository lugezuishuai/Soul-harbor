import { FriendListState, SelectSessionState, SocketState, UserInfoState } from '@/redux/reducers/state';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Action } from '@/redux/actions';
import { Form, Input, Button, message, Icon, Spin, Drawer, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import Down from '@/assets/icon/down.svg';
import ChatMenu from '@/assets/icon/chat-menu.svg';
import AddMember from '@/assets/icon/add-member.svg';
import { Message } from '../message';
import defaultAvatar from '@/assets/image/default-avatar.png';
import robotAvatar from '@/assets/image/robot.png';
import { GetHistoryMsgReq, GetHistoryMsgRes, MsgInfo } from '@/interface/chat/getHistoryMsg';
import { apiGet, apiPost } from '@/utils/request';
import {
  EXIT_GROUP,
  GET_GROUP_MEMBERS,
  GET_HISTORY_MSG,
  GET_SESSION_INFO,
  READ_UNREAD_MSG,
  ROBOT_CHAT,
} from '@/constants/urls';
import { ReadUnreadMsgReq } from '@/interface/chat/readUnreadMsg';
import { useChat } from '../../state';
import { debounce } from 'lodash';
import { RobotChatReq, RobotChatRes, SendMessageBody } from '@/interface/chat/robotChat';
import { GetGroupMembersReq, GetGroupMembersRes } from '@/interface/chat/getGroupMembers';
import { MemberInfo } from '@/interface/chat/newGroupChat';
import { GroupMemberCard } from '../groupMemberCard';
import { addGroupMember } from '../openGroupChatModal/addMembers';
import Cookie from 'js-cookie';
import { ExitGroupReq } from '@/interface/chat/exitGroup';
import { SELECT_SESSION, UPDATE_SESSION_INFO } from '@/redux/actions/action_types';
import { GetSessionInfoReq, GetSessionInfoRes } from '@/interface/chat/getSessionInfo';
import './index.less';

const { confirm } = Modal;

interface ChatRoomProps extends FormComponentProps {
  dispatch(action: Action): void;
  getGroupsList(): Promise<any>;
  getSessionsList(): Promise<any>;
  updateUnreadMsg(): Promise<any>;
  socket: SocketState;
  userInfo: UserInfoState;
  selectSession: SelectSessionState;
  friendsList: FriendListState;
}

interface FormValues {
  msg: string;
}

function ChatRoom({
  selectSession,
  form,
  socket,
  userInfo,
  friendsList,
  dispatch,
  getGroupsList,
  getSessionsList,
  updateUnreadMsg,
}: ChatRoomProps) {
  const { getFieldDecorator, resetFields, validateFields } = form;
  const { sessionMsg, setSessionMsg } = useChat();
  const [readMessage, setReadMessage] = useState<MsgInfo[]>([]); // 已读信息
  const [unreadMessage, setUnreadMessage] = useState<MsgInfo[]>([]); // 未读信息
  const [membersList, setMembersList] = useState<MemberInfo[]>([]); // 群成员列表
  const [visible, setVisible] = useState(false); // drawer 显示与否
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>();

  // 更新会话信息
  async function updateSessionInfo(sessionId: string, type: 'private' | 'room') {
    const reqData: GetSessionInfoReq = {
      sessionId: sessionId,
      type: type,
    };

    const {
      data: { sessionInfo },
    }: GetSessionInfoRes = await apiGet(GET_SESSION_INFO, reqData);

    if (sessionInfo) {
      dispatch({
        type: UPDATE_SESSION_INFO,
        payload: sessionInfo,
      });
    }
  }

  // 发送机器人聊天信息
  async function sendRobotMsg(sendMsgBody: SendMessageBody) {
    try {
      const reqData: RobotChatReq = {
        messageBody: sendMsgBody,
      };
      const {
        data: { message },
      }: RobotChatRes = await apiPost(ROBOT_CHAT, reqData);

      updateSessionInfo('0', 'private');

      if (message) {
        setSessionMsg(message);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleClickMenu() {
    setVisible(!visible);
  }

  function handleCloseDrawer() {
    setVisible(false);
  }

  // 获取自己的权限
  function getRole() {
    if (!membersList) {
      return;
    }
    const ownInfo = membersList.find((memberInfo) => Cookie.get('uuid') === memberInfo.member_id);
    if (ownInfo) {
      return ownInfo.member_role;
    }
  }

  // 退出群聊
  async function exitGroup() {
    try {
      if (selectSession?.type === 'room') {
        const reqData: ExitGroupReq = {
          room_id: selectSession.sessionId,
        };

        await apiPost(EXIT_GROUP, reqData);
        message.success('退出成功');

        dispatch({
          type: SELECT_SESSION,
          payload: null,
        });

        getGroupsList(); // 拉取群聊信息
        getSessionsList(); // 拉取会话信息
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleExitGroup() {
    if (getRole() === 0) {
      confirm({
        title: '注意',
        content: '群主不能退出群聊',
        centered: true,
        okText: '确认',
        cancelText: '取消',
      });
    } else if (membersList.length < 4) {
      confirm({
        title: '注意',
        content: '抱歉，当前群人数小于4人，不允许退出群聊',
        centered: true,
        okText: '确认',
        cancelText: '取消',
      });
    } else {
      confirm({
        title: '注意',
        content: '您确定要退出群聊吗？退出之后会删除群聊历史信息',
        centered: true,
        okText: '确认',
        cancelText: '取消',
        onOk: exitGroup,
      });
    }
  }

  // 发送聊天信息
  function handleSendMsg(e: any) {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: FormValues) => {
      const { msg } = values;
      if (!errors) {
        if (!msg) {
          debounce(() => {
            message.destroy();
            message.error({
              content: '不能发送空消息',
              key: 'sent_empty_message',
              duration: 1,
            });
          }, 200)();
        } else {
          if (socket) {
            try {
              if (selectSession) {
                const { sessionId, type } = selectSession;
                const nowTime = dayjs().unix();
                const sendMsgBody: SendMessageBody = {
                  sender_id: Cookies.get('uuid') || '',
                  sender_avatar: userInfo?.avatar || null,
                  receiver_id: sessionId,
                  message: msg,
                  message_id: nowTime,
                  time: nowTime,
                };
                if (sessionId !== '0') {
                  socket.emit(type === 'private' ? 'private message' : 'room message', sendMsgBody);
                } else {
                  // 机器人聊天
                  sendRobotMsg(sendMsgBody);
                }

                if (selectSession.type === 'private') {
                  const msgBySelf: MsgInfo = {
                    ...sendMsgBody,
                    time: dayjs(nowTime * 1000).format('h:mm a'),
                    type: 'online',
                    sender_avatar: userInfo?.avatar || null,
                    private_chat: 0,
                  };

                  const newReadMessage: MsgInfo[] = [...readMessage, msgBySelf];
                  setReadMessage(newReadMessage);
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
          resetFields(['msg']);
        }
      }
    });
  }

  function handleKeyPress(e: any) {
    if (e.nativeEvent.keyCode === 13) {
      handleSendMsg(e);
    }
  }

  // 获取历史信息
  const getHistoryMsg = useCallback(async () => {
    try {
      if (selectSession) {
        setLoading(true);
        const { sessionId, type } = selectSession;
        const reqData: GetHistoryMsgReq = {
          sessionId,
          type,
        };

        const {
          data: { message },
        }: GetHistoryMsgRes = await apiGet(GET_HISTORY_MSG, reqData);

        if (message) {
          const readHisMsg: MsgInfo[] = [],
            unreadHisMsg: MsgInfo[] = [];
          for (const msg of message) {
            if (msg.type === 'online') {
              readHisMsg.push(msg);
            } else {
              unreadHisMsg.push(msg);
            }
          }

          setReadMessage(readHisMsg);
          setUnreadMessage(unreadHisMsg);
        }

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  }, [selectSession]);

  // 获取群成员列表
  const getGroupMembers = useCallback(async () => {
    try {
      if (selectSession?.type === 'room') {
        const reqData: GetGroupMembersReq = {
          room_id: selectSession.sessionId,
        };

        const {
          data: { members },
        }: GetGroupMembersRes = await apiGet(GET_GROUP_MEMBERS, reqData);
        if (members) {
          setMembersList(members);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectSession]);

  // 添加群成员
  async function handleAddMember() {
    try {
      if (!friendsList || !selectSession || selectSession.type !== 'room') {
        return;
      }

      const selectedIds = membersList
        .map((memberInfo) => memberInfo.member_id)
        .filter((id) => id !== Cookie.get('uuid'));
      await addGroupMember(friendsList, selectedIds, selectSession.sessionId, getGroupMembers);
    } catch (e) {
      console.error(e);
    }
  }

  // 点击未读信息
  async function handleClickUnreadMsg() {
    if (selectSession) {
      const { sessionId, type } = selectSession;
      const reqData: ReadUnreadMsgReq = {
        sessionId,
        type,
      };

      await apiPost(READ_UNREAD_MSG, reqData);

      await getHistoryMsg(); // 更新历史信息
      await updateUnreadMsg(); // 更新未读信息
    }
  }

  // 拼接接收到的信息
  const receiveMsg = useCallback(() => {
    if (sessionMsg) {
      const newReadMsg = [...readMessage, sessionMsg];
      setReadMessage(newReadMsg);
      setSessionMsg(null); // 清空sessionMsg
    }
  }, [sessionMsg]);

  useEffect(() => {
    getHistoryMsg();
    getGroupMembers();
  }, [getHistoryMsg]);

  useEffect(() => {
    receiveMsg();
  }, [receiveMsg]);

  useEffect(() => {
    if (readMessage && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight; // 容器滚动到最底部
    }
  }, [readMessage]);

  return (
    selectSession && (
      <div className="chat-room">
        <div className="chat-room-header">
          <div className="chat-room-header-username">{selectSession.name}</div>
          {selectSession.type === 'room' && (
            <Icon className="chat-room-header-icon" component={ChatMenu as any} onClick={handleClickMenu} />
          )}
        </div>
        <div className="chat-room-container">
          {selectSession.type === 'room' && (
            <Drawer
              className="chat-room-drawer"
              placement="right"
              closable={false}
              onClose={handleCloseDrawer}
              visible={visible}
              getContainer={false}
            >
              <div className="chat-room-drawer-content">
                <div className="chat-room-drawer-content-label">群聊名称</div>
                <div className="chat-room-drawer-content-text">{selectSession.name}</div>
                <div className="chat-room-drawer-content-label">群成员</div>
                <div className="chat-room-drawer-content-member">
                  <div className="chat-room-drawer-content-member-add" onClick={handleAddMember}>
                    <Icon className="chat-room-drawer-content-member-add-icon" component={AddMember as any} />
                    <div className="chat-room-drawer-content-member-add-text">添加成员</div>
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
              <Button type="danger" className="chat-room-drawer-btn" onClick={handleExitGroup}>
                退出群聊
              </Button>
            </Drawer>
          )}
          <div className="chat-room-content" ref={ref as any}>
            <Spin spinning={loading}>
              {readMessage.map((msg, index) => {
                const type: 'send' | 'receive' = msg.sender_id === Cookies.get('uuid') ? 'send' : 'receive';
                return (
                  <Message
                    key={index}
                    avatar={
                      selectSession.sessionId === '0' && type === 'receive'
                        ? robotAvatar
                        : msg.sender_avatar || defaultAvatar
                    }
                    type={type}
                    message={msg.message}
                    time={msg.time}
                  />
                );
              })}
              {unreadMessage.length > 0 && (
                <div className="chat-room-content-unread" onClick={handleClickUnreadMsg}>
                  <Icon className="chat-room-content-unread__icon" component={Down as any} />
                  <div className="chat-room-content-unread__text">{`${unreadMessage.length}条未读信息`}</div>
                </div>
              )}
            </Spin>
          </div>
          <div className="chat-room-send">
            <Form className="chat-room-send__form">
              <Form.Item>
                {getFieldDecorator('msg')(
                  <Input
                    className="chat-room-send__input"
                    placeholder="按Enter或”发送“发送信息"
                    autoComplete="off"
                    allowClear={false}
                    onKeyPress={handleKeyPress}
                  />
                )}
              </Form.Item>
            </Form>
            <Button type="primary" className="chat-room-send__btn" onClick={handleSendMsg}>
              发送
            </Button>
          </div>
        </div>
      </div>
    )
  );
}

export const WrapChatRoom = Form.create<ChatRoomProps>({
  name: 'chat-room',
})(ChatRoom);

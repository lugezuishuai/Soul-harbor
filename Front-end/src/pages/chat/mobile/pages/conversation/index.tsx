import { Button, Drawer, Form, Icon, Input, message, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Action } from '@/redux/actions';
import { FriendListState, SelectSessionState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { FormComponentProps } from 'antd/lib/form';
import ChatMenu from '@/assets/icon/chat-menu.svg';
import { useHistory } from 'react-router-dom';
import { GetHistoryMsgReq, GetHistoryMsgRes, MsgInfo } from '@/interface/chat/getHistoryMsg';
import { apiGet, apiPost } from '@/utils/request';
import { GET_GROUP_MEMBERS, GET_HISTORY_MSG, GET_SESSION_INFO, READ_UNREAD_MSG, ROBOT_CHAT } from '@/constants/urls';
import { useChat } from '@/pages/chat/state';
import { GetGroupMembersReq, GetGroupMembersRes } from '@/interface/chat/getGroupMembers';
import { Message } from '@/pages/chat/component/message';
import Down from '@/assets/icon/down.svg';
import defaultAvatar from '@/assets/image/default-avatar.png';
import robotAvatar from '@/assets/image/robot.png';
import Cookies from 'js-cookie';
import { ReadUnreadMsgReq } from '@/interface/chat/readUnreadMsg';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import { RobotChatReq, RobotChatRes, SendMessageBody } from '@/interface/chat/robotChat';
import { GetSessionInfoReq, GetSessionInfoRes } from '@/interface/chat/getSessionInfo';
import { UPDATE_SESSION_INFO } from '@/redux/actions/action_types';
import './index.less';

export interface ConversationMobileProps extends FormComponentProps {
  dispatch(action: Action): void;
  getGroupsList(): Promise<void>;
  getSessionsList(): Promise<void>;
  updateUnreadMsg(): Promise<void>;
  socket: SocketState;
  userInfo: UserInfoState;
  selectSession: SelectSessionState;
  friendsList: FriendListState;
}

interface FormValues {
  msg: string;
}

function ConversationMobile({
  dispatch,
  getGroupsList,
  getSessionsList,
  updateUnreadMsg,
  socket,
  userInfo,
  selectSession,
  friendsList,
  form,
}: ConversationMobileProps) {
  const history = useHistory();
  const { getFieldDecorator, validateFields, resetFields } = form;
  const { calculateHisMsg, setMembersList, setSessionMsg, setReadMessage, receiveMsg, readMessage, unreadMessage } =
    useChat();
  const [visible, setVisible] = useState(false); // 控制右侧菜单的显示
  const [loading, setLoading] = useState(false);
  const [activeMsgId, setActiveMsgId] = useState<number | null>(null); // 活跃消息的messageId(用于聊天记录查询定位信息)
  const ref = useRef<HTMLDivElement>();
  const contentsRef = useRef<Record<number, HTMLDivElement>>({});

  function handleGoBack() {
    history.goBack();
  }

  function handleClickMenu() {
    setVisible(!visible);
  }

  const handleCloseDrawer = useCallback(() => {
    setVisible(false);
  }, []);

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

        message && calculateHisMsg(message, selectSession);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [calculateHisMsg, selectSession]);

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
  }, [selectSession, setMembersList]);

  useEffect(() => {
    getHistoryMsg();
  }, [getHistoryMsg]);

  useEffect(() => {
    getGroupMembers();
  }, [getGroupMembers]);

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
      <div className="conversation-mobile">
        <div className="conversation-mobile__header">
          <Icon type="left" className="conversation-mobile__header__back" onClick={handleGoBack} />
          <div className="conversation-mobile__header__name">{selectSession.name}</div>
          <Icon component={ChatMenu as any} className="conversation-mobile__header__menu" onClick={handleClickMenu} />
        </div>
        <Drawer
          className="conversation-mobile__drawer"
          placement="right"
          closable={false}
          onClose={handleCloseDrawer}
          visible={visible}
          width={window.innerWidth}
          getContainer={document.getElementsByClassName('home__container')[0] as HTMLElement}
        >
          {selectSession.type === 'room' ? <div /> : <div />}
        </Drawer>
        <div className="conversation-mobile__container">
          <div className="conversation-mobile__content" ref={ref as any}>
            <Spin spinning={loading}>
              {readMessage.map((msg, index) => {
                const type: 'send' | 'receive' = msg.sender_id === Cookies.get('uuid') ? 'send' : 'receive';
                return (
                  <Message
                    key={index}
                    onMount={(dom) => (contentsRef.current[msg.message_id] = dom)}
                    avatar={
                      selectSession.sessionId === '0' && type === 'receive'
                        ? robotAvatar
                        : msg.sender_avatar || defaultAvatar
                    }
                    type={type}
                    message={msg.message}
                    time={msg.time}
                    activeMessage={msg.message_id === activeMsgId}
                  />
                );
              })}
              {unreadMessage.length > 0 && (
                <div className="conversation-mobile__content__unread" onClick={handleClickUnreadMsg}>
                  <Icon className="conversation-mobile__content__unread__icon" component={Down as any} />
                  <div className="conversation-mobile__content__unread__text">{`${unreadMessage.length}条未读信息`}</div>
                </div>
              )}
            </Spin>
          </div>
          <div className="conversation-mobile__send">
            <Form className="conversation-mobile__send__form">
              {getFieldDecorator('msg')(
                <Input className="conversation-mobile__send__input" autoComplete="off" allowClear={false} />,
              )}
            </Form>
            <Button type="primary" className="conversation-mobile__send__btn" onClick={handleSendMsg}>
              发送
            </Button>
          </div>
        </div>
      </div>
    )
  );
}

export const WrapConversationMobile = Form.create<ConversationMobileProps>({
  name: 'conversation-mobile',
})(ConversationMobile);

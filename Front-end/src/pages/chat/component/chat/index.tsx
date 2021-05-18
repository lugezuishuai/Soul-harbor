import { SelectSessionState, SocketState, UserInfoState } from '@/redux/reducers/state';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Action } from '@/redux/actions';
import { Form, Input, Button, message, Icon, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import Down from '@/assets/icon/down.svg';
import { Message } from '../message';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { GetHistoryMsgReq, GetHistoryMsgRes, MsgInfo } from '@/interface/chat/getHistoryMsg';
import { apiGet, apiPost } from '@/utils/request';
import { GET_HISTORY_MSG, READ_UNREAD_MSG, ROBOT_CHAT } from '@/constants/urls';
import { ReadUnreadMsgReq } from '@/interface/chat/readUnreadMsg';
import { useChat } from '../../state';
import { debounce } from 'lodash';
import { RobotChatReq, RobotChatRes, SendMessageBody } from '@/interface/chat/robotChat';
import './index.less';

interface ChatRoomProps extends FormComponentProps {
  dispatch(action: Action): void;
  socket: SocketState;
  userInfo: UserInfoState;
  selectSession: SelectSessionState;
}

interface FormValues {
  msg: string;
}

function ChatRoom({ selectSession, form, socket, userInfo }: ChatRoomProps) {
  const { getFieldDecorator, resetFields, validateFields } = form;
  const { sessionMsg, setSessionMsg } = useChat();
  const [readMessage, setReadMessage] = useState<MsgInfo[]>([]); // 已读信息
  const [unreadMessage, setUnreadMessage] = useState<MsgInfo[]>([]); // 未读信息
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>();

  // // 点击未读信息
  // function handleClickUnRead() {
  //   // 将所有的信息设置成已读
  //   setUnreadMsgCount(0);
  //   dispatch({
  //     type: UNREAD,
  //     payload: false,
  //   });
  //   if (chatMessage && chatMessage && selectUser?.userInfo?.uid && chatMessage[selectUser.userInfo.uid]) {
  //     const receiveUid = selectUser.userInfo.uid;
  //     const newChatMessage = {
  //       ...chatMessage,
  //       [receiveUid]: chatMessage[receiveUid].map((msg) => {
  //         if (msg.messageId !== msg.readMessageId) {
  //           msg.readMessageId = msg.messageId;
  //         }

  //         return msg;
  //       }),
  //     };

  //     setReadMessage(newChatMessage[receiveUid]);
  //     dispatch({
  //       type: PRIVATE_CHAT,
  //       payload: newChatMessage,
  //     });
  //   }
  // }

  // 发送机器人聊天信息
  async function sendRobotMsg(sendMsgBody: SendMessageBody) {
    try {
      const reqData: RobotChatReq = {
        messageBody: sendMsgBody,
      };
      const {
        data: { message },
      }: RobotChatRes = await apiPost(ROBOT_CHAT, reqData);

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

                const msgBySelf: MsgInfo = {
                  ...sendMsgBody,
                  time: dayjs(nowTime * 1000).format('h:mm a'),
                  type: 'online',
                  sender_avatar: userInfo?.avatar || null,
                };

                const newReadMessage: MsgInfo[] = [...readMessage, msgBySelf];
                setReadMessage(newReadMessage);
              }
            } catch (e) {
              console.error(e);
            }
          }
          resetFields(['msg']);
          setTimeout(() => {
            if (ref.current) {
              ref.current.scrollTop = ref.current.scrollHeight;
            }
          }, 0);
        }
      }
    });
  }

  function handleKeyPress(e: any) {
    if (e.nativeEvent.keyCode === 13) {
      handleSendMsg(e);
    }
  }

  // const renderMessage = useCallback(() => {
  //   console.log('chatMessage: ', chatMessage);
  //   const uid = selectUser?.userInfo?.uid || '';

  //   if (chatMessage && chatMessage[uid]) {
  //     console.log('message: ', chatMessage[uid]);
  //     if (unread) {
  //       const alreadyReadMsg = chatMessage[uid].filter((msg) => msg.messageId === msg.readMessageId);
  //       setReadMessage(alreadyReadMsg);
  //       setUnreadMsgCount(chatMessage[uid].length - alreadyReadMsg.length);
  //     } else {
  //       setReadMessage(chatMessage[uid]);
  //     }
  //   }
  // }, [selectUser, chatMessage, unread]);

  // 获取历史信息
  const getHistoryMsg = useCallback(async () => {
    try {
      if (selectSession) {
        setLoading(true);
        const { sessionId } = selectSession;
        const reqData: GetHistoryMsgReq = {
          sessionId,
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

  // 点击未读信息
  const handleClickUnreadMsg = useCallback(async () => {
    if (selectSession) {
      const { sessionId, type } = selectSession;
      const reqData: ReadUnreadMsgReq = {
        sessionId,
        type,
      };

      await apiPost(READ_UNREAD_MSG, reqData);

      // 重新拉取一次数据
      getHistoryMsg();
    }
  }, [getHistoryMsg, selectSession]);

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
  }, [getHistoryMsg]);

  useEffect(() => {
    receiveMsg();
  }, [receiveMsg]);

  return (
    selectSession && (
      <div className="chat-room">
        <div className="chat-room-header">
          <div className="chat-room-header-username">{selectSession.name}</div>
        </div>
        <div className="chat-room-container">
          <div className="chat-room-content" ref={ref as any}>
            <Spin spinning={loading}>
              {readMessage.map((msg, index) => {
                const type: 'send' | 'receive' = msg.sender_id === Cookies.get('uuid') ? 'send' : 'receive';
                return (
                  <Message
                    key={index}
                    avatar={msg.sender_avatar || defaultAvatar}
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

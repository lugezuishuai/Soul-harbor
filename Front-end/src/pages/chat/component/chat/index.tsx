import { ChatMessageState, SocketState, UserInfoState } from '@/redux/reducers/state';
import React, { useCallback, useEffect, useState } from 'react';
import { useChat } from '../../state';
import { MessageBody } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { UNREAD, PRIVATE_CHAT } from '@/redux/actions/action_types';
import { Form, Input, Button, message, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import Down from '@/assets/icon/down.svg';
import { Message } from '../message';
import defaultAvatar from '@/assets/image/default-avatar.png';
import './index.less';

interface ChatRoomProps extends FormComponentProps {
  dispatch(action: Action): void;
  unread: boolean;
  chatMessage: ChatMessageState;
  socket: SocketState;
  userInfo: UserInfoState;
}

interface FormValues {
  msg: string;
}

interface SendMessageBody {
  senderId: string;
  receiverId: string;
  message: string;
  messageId: number;
  time: number;
}

function ChatRoom({ chatMessage, unread, dispatch, form, socket, userInfo }: ChatRoomProps) {
  const { selectUser } = useChat();
  const { getFieldDecorator, resetFields, validateFields } = form;
  const [readMessage, setReadMessage] = useState<MessageBody[]>([]); // 该会话已读信息（按照messageId排序）
  const [unreadMsgCount, setUnreadMsgCount] = useState(0); // 该会话未读信息条数

  // 点击未读信息
  function handleClickUnRead() {
    // 将所有的信息设置成已读
    setUnreadMsgCount(0);
    dispatch({
      type: UNREAD,
      payload: false,
    });
    if (chatMessage && chatMessage && selectUser?.userInfo?.uid && chatMessage[selectUser.userInfo.uid]) {
      const receiveUid = selectUser.userInfo.uid;
      const newChatMessage = {
        ...chatMessage,
        [receiveUid]: chatMessage[receiveUid].map((msg) => {
          if (msg.messageId !== msg.readMessageId) {
            msg.readMessageId = msg.messageId;
          }

          return msg;
        }),
      };

      setReadMessage(newChatMessage[receiveUid]);
      dispatch({
        type: PRIVATE_CHAT,
        payload: newChatMessage,
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
          message.error('不能发送空信息');
        } else {
          if (socket) {
            try {
              const receiverId = selectUser?.userInfo?.uid || '';
              const nowTime = dayjs().unix();
              const sendMsgBody: SendMessageBody = {
                senderId: Cookies.get('uuid') || '',
                receiverId,
                message: msg,
                messageId: nowTime,
                time: nowTime,
              };
              socket.emit('private message', sendMsgBody);
              let newChatMessage;
              const messageBody: MessageBody = {
                ...sendMsgBody,
                readMessageId: sendMsgBody.messageId,
                time: dayjs(sendMsgBody.time * 1000).format('h:mm a'),
              };
              if (chatMessage) {
                newChatMessage = JSON.parse(JSON.stringify(chatMessage));
                if (newChatMessage && receiverId && newChatMessage[receiverId]) {
                  newChatMessage[receiverId].push(messageBody);
                  newChatMessage[receiverId].sort((a: MessageBody, b: MessageBody) => a.messageId - b.messageId);
                } else {
                  newChatMessage[receiverId] = [messageBody];
                }
              } else {
                newChatMessage = {
                  [receiverId]: [messageBody],
                };
              }

              dispatch({
                type: PRIVATE_CHAT,
                payload: newChatMessage,
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
        resetFields(['msg']);
      }
    });
  }

  function handleKeyPress(e: any) {
    if (e.nativeEvent.keyCode === 13) {
      handleSendMsg(e);
    }
  }

  const renderMessage = useCallback(() => {
    console.log('chatMessage: ', chatMessage);
    const uid = selectUser?.userInfo?.uid || '';

    if (chatMessage && chatMessage[uid]) {
      console.log('message: ', chatMessage[uid]);
      if (unread) {
        const alreadyReadMsg = chatMessage[uid].filter((msg) => msg.messageId === msg.readMessageId);
        setReadMessage(alreadyReadMsg);
        setUnreadMsgCount(chatMessage[uid].length - alreadyReadMsg.length);
      } else {
        setReadMessage(chatMessage[uid]);
      }
    }
  }, [selectUser, chatMessage, unread]);

  useEffect(() => {
    renderMessage();
  }, [renderMessage]);

  return (
    selectUser && (
      <div className="chat-room">
        <div className="chat-room-header">
          <div className="chat-room-header-username">{selectUser.userInfo?.username}</div>
        </div>
        <div className="chat-room-container">
          <div className="chat-room-content">
            {readMessage.map((msg, index) => {
              const type: 'send' | 'receive' = msg.receiverId === selectUser.userInfo?.uid ? 'send' : 'receive';
              const avatar = type === 'send' ? userInfo?.avatar : selectUser.userInfo?.avatar;
              return (
                <Message
                  key={index}
                  avatar={avatar || defaultAvatar}
                  type={type}
                  message={msg.message}
                  time={msg.time}
                />
              );
            })}
            {unreadMsgCount > 0 && (
              <div className="chat-room-content-unread" onClick={handleClickUnRead}>
                <Icon className="chat-room-content-unread__icon" component={Down as any} />
                <div className="chat-room-content-unread__text">{`${unreadMsgCount}条未读信息`}</div>
              </div>
            )}
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

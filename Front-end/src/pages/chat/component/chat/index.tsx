import { ChatMessageState, SocketState } from '@/redux/reducers/state';
import React, { useCallback, useEffect, useState } from 'react';
import { useChat } from '../../state';
import { MessageBody } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { UNREAD, PRIVATE_CHAT } from '@/redux/actions/action_types';
import { Form, Input, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import './index.less';

interface ChatRoomProps extends FormComponentProps {
  dispatch(action: Action): void;
  unread: boolean;
  chatMessage: ChatMessageState;
  socket: SocketState;
}

interface FormValues {
  msg: string;
}

interface SendMessageBody {
  senderId: string;
  receiveId: string;
  message: string;
  messageId: number;
}

function ChatRoom({ chatMessage, unread, dispatch, form, socket }: ChatRoomProps) {
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
            const sendMsgBody: SendMessageBody = {
              senderId: Cookies.get('uuid') || '',
              receiveId: selectUser?.userInfo?.uid || '',
              message: msg,
              messageId: dayjs().unix(),
            };
            socket.emit('private message', sendMsgBody);
          }
        }
      }
    });
  }

  const renderMessage = useCallback(() => {
    if (chatMessage && selectUser?.userInfo?.uid && chatMessage[selectUser.userInfo.uid]) {
      const receiveUid = selectUser.userInfo.uid;
      if (unread) {
        const alreadyReadMsg = chatMessage[receiveUid].filter((msg) => msg.messageId === msg.readMessageId);
        setReadMessage(alreadyReadMsg);
        setUnreadMsgCount(chatMessage[receiveUid].length - alreadyReadMsg.length);
      } else {
        setReadMessage(chatMessage[receiveUid]);
      }
    }
  }, [selectUser]);

  useEffect(() => {
    renderMessage();
  }, [renderMessage]);

  return (
    selectUser && (
      <div className="chat-room">
        <div className="chat-room-header">
          <div className="chat-room-header-username">{selectUser.userInfo?.username}</div>
        </div>
        <div className="chat-room-content"></div>
        <div className="chat-room-send">
          <Form className="chat-room-form">
            <Form.Item className="chat-room-form__item">
              {getFieldDecorator('msg')(
                <Input
                  className="chat-room-input"
                  placeholder="按Enter或”发送“发送信息"
                  autoComplete="off"
                  allowClear={false}
                />
              )}
            </Form.Item>
          </Form>
          <Button type="primary" className="chat-room-btn" onClick={handleSendMsg}>
            发送
          </Button>
        </div>
      </div>
    )
  );
}

export const WrapChatRoom = Form.create({
  name: 'chat-room',
})(ChatRoom);

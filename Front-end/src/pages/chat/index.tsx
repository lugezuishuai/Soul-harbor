import { LoginState, State, UserInfoState } from '@/redux/reducers/state';
import { Form, Button, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import './index.less';

interface ChatPageProps extends FormComponentProps {
  login: LoginState;
  userInfo: UserInfoState;
}

interface JoinRoom {
  username: string;
  room: string;
}

interface User {
  id: string;
  username: string;
  room: string;
}

interface RoomUsers {
  room: string;
  users: User[];
}

interface FormValues {
  message: string;
}

const socket = io('http://localhost:4001/chat', { forceNew: true });
function ChatPage(props: ChatPageProps) {
  const { login, userInfo, form } = props;
  const { validateFields, getFieldDecorator } = form;

  function handleSendMsg(e: any) {
    e.preventDefault();
    validateFields((errors: Record<string, any>, values: FormValues) => {
      const { message } = values;
      if (!errors && message) {
        socket.emit('chatMessage', message);
      }
    });
  }

  useEffect(() => {
    if (!login || !userInfo) {
      return;
    }

    socket.on('message', (msg) => {
      console.log('message', msg);
    });

    socket.on('roomUsers', (data: RoomUsers) => {
      const { room, users } = data;
      console.log('room: ', room);
      console.log('users: ', users);
    });

    socket.on('chatMessage', (msg) => {
      console.log('chat message: ', msg);
    });

    const { username } = userInfo;
    if (username) {
      const joinRoomInfo: JoinRoom = {
        username,
        room: 'test',
      };
      socket.emit('join room', joinRoomInfo);
    }

    return () => {
      socket.close();
    };
  }, [login, userInfo]);

  return (
    <div className="chat-page">
      <Form className="chat-page-form">
        <Form.Item className="chat-page-form__item">
          {getFieldDecorator('message')(<Input placeholder="信息" autoComplete="off" allowClear={true} />)}
        </Form.Item>
      </Form>
      <Button className="chat-page-button" onClick={handleSendMsg}>
        发送
      </Button>
    </div>
  );
}

export const WrapChatPage = connect((state: State) => ({
  login: state.user.login,
  userInfo: state.user.userInfo,
}))(
  Form.create<ChatPageProps>({
    name: 'chat-page',
  })(ChatPage)
);

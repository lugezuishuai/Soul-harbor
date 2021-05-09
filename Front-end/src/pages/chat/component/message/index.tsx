import { Avatar } from 'antd';
import React from 'react';
import './index.less';

interface MessageProps {
  type: 'send' | 'receive';
  message: string;
  avatar: string;
  time: string;
}

export function Message(props: MessageProps) {
  const { type, message, avatar, time } = props;
  <div className="chat-message" style={type === 'receive' ? { flexFlow: 'row-reverse' } : {}}>
    <div className="chat-message-user">
      <Avatar className="chat-message-avatar" src={avatar} />
      <div className="chat-message-time">{time}</div>
    </div>
    <div className="chat-message-content" style={{ backgroundColor: type === 'send' ? '#b8f189' : '#EFF0F1' }}>
      {message}
    </div>
  </div>;
}

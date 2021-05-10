import { Avatar } from 'antd';
import React from 'react';
import { useChat } from '../../state';
import './index.less';

interface MessageProps {
  type: 'send' | 'receive';
  message: string;
  time: string;
}

export function Message(props: MessageProps) {
  const { type, message, time } = props;
  const { selectUser } = useChat();
  const receive = type === 'receive';

  return (
    <div className="chat-message" style={receive ? { flexFlow: 'row-reverse' } : {}}>
      <div className="chat-message-user" style={receive ? { marginRight: 20 } : { marginLeft: 20 }}>
        <Avatar className="chat-message-avatar" src={selectUser?.userInfo?.avatar || ''} />
        <div className="chat-message-time">{time}</div>
      </div>
      <div className="chat-message-content" style={{ backgroundColor: type === 'send' ? '#b8f189' : '#EFF0F1' }}>
        {message}
      </div>
    </div>
  );
}

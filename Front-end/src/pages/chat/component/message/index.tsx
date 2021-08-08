import { noop } from '@/utils/noop';
import { Avatar } from 'antd';
import React from 'react';
import './index.less';

interface MessageProps {
  onMount?: (dom: HTMLDivElement) => void;
  type: 'send' | 'receive';
  avatar: string;
  message: string;
  time: string;
}

export function Message(props: MessageProps) {
  const { type, message, time, avatar, onMount = noop } = props;
  const receive = type === 'receive';

  return (
    <div className="chat-message" ref={(dom) => dom && onMount(dom)} style={receive ? {} : { flexFlow: 'row-reverse' }}>
      <div className="chat-message-user" style={receive ? { marginRight: 16 } : { marginLeft: 16 }}>
        <Avatar className="chat-message-avatar" src={avatar} />
        <div className="chat-message-time">{time}</div>
      </div>
      <div
        className="chat-message-content"
        style={type === 'send' ? { background: '#b8f189' } : { background: '#DEE0E3' }}
      >
        {message}
      </div>
    </div>
  );
}

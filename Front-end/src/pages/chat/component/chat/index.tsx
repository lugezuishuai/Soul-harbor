import React from 'react';
import { useChat } from '../../state';
import './index.less';

export function ChatRoom() {
  const { selectUser } = useChat();
  return selectUser && (
    <div className="chat-room">
      <div className="chat-room-header">
        <div className="chat-room-header-username">{selectUser.userInfo?.username}</div>
      </div>
      <div className="chat-room-content">
        
      </div>
    </div>
  )
}
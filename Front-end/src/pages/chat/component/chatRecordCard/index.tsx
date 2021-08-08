import { SearchChatRecord } from '@/interface/chat/searchChatRecords';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { Avatar } from 'antd';
import React from 'react';
import { highLightKeyword } from '@/utils/highLightKeyword';
import './index.less';

interface ChatRecordCardProps {
  scrollToSpecifyLocation(messageId: number): void;
  handleCloseDrawer(): void;
  record: SearchChatRecord;
  keyword: string;
}

export function ChatRecordCard({ scrollToSpecifyLocation, handleCloseDrawer, record, keyword }: ChatRecordCardProps) {
  const { sender_avatar, sender_username, message, message_id, time } = record;
  function handleClick() {
    handleCloseDrawer();
    scrollToSpecifyLocation(message_id);
  }

  return (
    <div className="chat-record-card" onClick={handleClick}>
      <Avatar className="chat-record-card__avatar" src={sender_avatar || defaultAvatar} />
      <div className="chat-record-card__info">
        <div className="chat-record-card__top">
          <div className="chat-record-card__username">{sender_username}</div>
          <div className="chat-record-card__time">{time}</div>
        </div>
        <div
          className="chat-record-card__message"
          dangerouslySetInnerHTML={{ __html: highLightKeyword(message, keyword) }}
        />
      </div>
    </div>
  );
}

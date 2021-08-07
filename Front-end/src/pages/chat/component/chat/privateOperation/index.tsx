import { FriendInfo } from '@/interface/chat/getFriendsList';
import { FriendListState, SelectSession } from '@/redux/reducers/state';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { Avatar } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { FoldingPanel } from '@/components/folding-panel';
import { SearchChatRecordsData } from '@/interface/chat/searchChatRecords';
import './index.less';

interface PrivateOperationProps {
  selectSession: SelectSession;
  friendsList: FriendListState;
}

export function PrivateOperation({ selectSession, friendsList }: PrivateOperationProps) {
  const [friendInfo, setFriendInfo] = useState<FriendInfo | null>(null);
  const [chatRecordFold, setChatRecordFold] = useState(false); // 「查找聊天记录」折叠状态
  const [chatRecordData, setChatRecordDat] = useState<SearchChatRecordsData | null>(null); // 「聊天记录」数据
  const getFriendInfo = useCallback(() => {
    if (!friendsList || !friendsList.length) {
      return;
    }

    const friendInfoData = friendsList.find((item) => selectSession.sessionId === item.friend_id);
    friendInfoData && setFriendInfo(friendInfoData);
  }, [friendsList, selectSession]);

  function handleChatRecordFold() {
    setChatRecordFold((chatRecordFold) => !chatRecordFold);
  }

  useEffect(() => {
    getFriendInfo();
  }, [getFriendInfo]);

  return (
    <div className="private-operation">
      <div className="private-operation__header">聊天详情</div>
      <div className="private-operation__info">
        <Avatar src={friendInfo?.friend_avatar || defaultAvatar} className="private-operation__info__avatar" />
        <div className="private-operation__info__username">{friendInfo?.friend_username}</div>
      </div>
      <div className="private-operation__content">
        <FoldingPanel handleFold={handleChatRecordFold} foldState={chatRecordFold} textContent="查找聊天记录" />
      </div>
    </div>
  );
}

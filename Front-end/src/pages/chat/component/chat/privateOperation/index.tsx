import { FriendInfo } from '@/interface/chat/getFriendsList';
import { FriendListState, SelectSession } from '@/redux/reducers/state';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { Avatar, Icon } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FoldingPanel } from '@/components/folding-panel';
import {
  SearchChatRecordsData,
  SearchChatRecordsRequest,
  SearchChatRecordsRes,
} from '@/interface/chat/searchChatRecords';
import { apiGet } from '@/utils/request';
import { SEARCH_CHAT_RECORDS } from '@/constants/urls';
import { WrapSearchRecords } from './searchRecords';
import { ChatRecordCard } from '../../chatRecordCard';
import NoResult from '@/assets/icon/no-result.svg';
import './index.less';

interface PrivateOperationProps {
  scrollToSpecifyLocation(messageId: number): void;
  handleCloseDrawer(): void;
  selectSession: SelectSession;
  friendsList: FriendListState;
}

function NoSearchResult() {
  return (
    <div className="private-operation__no-result">
      <Icon className="private-operation__no-result__icon" component={NoResult as any} />
      <div className="private-operation__no-result__text">没有搜索到聊天记录</div>
    </div>
  );
}

export function PrivateOperation({
  selectSession,
  friendsList,
  scrollToSpecifyLocation,
  handleCloseDrawer,
}: PrivateOperationProps) {
  const [friendInfo, setFriendInfo] = useState<FriendInfo | null>(null);
  const [chatRecordFold, setChatRecordFold] = useState(false); // 「查找聊天记录」折叠状态
  const [chatRecordData, setChatRecordData] = useState<SearchChatRecordsData | null>(null); // 「聊天记录」数据
  const timer = useRef(-1);

  const handleSearch = useCallback(
    (keyword: string) => {
      if (!friendInfo) {
        return;
      }

      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          const reqData: SearchChatRecordsRequest = {
            keyword,
            sessionId: friendInfo.friend_id,
          };
          const { data }: SearchChatRecordsRes = await apiGet(SEARCH_CHAT_RECORDS, reqData);
          setChatRecordData(data);
        } catch (e) {
          setChatRecordData(null);
          console.error(e);
        }
      }, 350) as any;
    },
    [friendInfo]
  );

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

  function renderSearchResult() {
    if (!chatRecordData) {
      return null;
    }

    if (!chatRecordData.records.length) {
      return <NoSearchResult />;
    } else {
      return (
        <div className="private-operation__search-content">
          {chatRecordData.records.map((record) => (
            <ChatRecordCard
              key={record.message_id}
              scrollToSpecifyLocation={scrollToSpecifyLocation}
              handleCloseDrawer={handleCloseDrawer}
              record={record}
              keyword={chatRecordData.keyword}
            />
          ))}
        </div>
      );
    }
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
      <FoldingPanel handleFold={handleChatRecordFold} foldState={chatRecordFold} textContent="查找聊天记录" />
      {!chatRecordFold && (
        <>
          <WrapSearchRecords handleSearch={handleSearch} />
          {renderSearchResult()}
        </>
      )}
    </div>
  );
}

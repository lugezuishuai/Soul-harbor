import { SearchContractsRoomInfo } from '@/interface/chat/searchContracts';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { SelectSession } from '@/redux/reducers/state';
import React from 'react';
import { Action } from '@/redux/actions';
import { Avatar } from 'antd';
import defaultGroup from '@/assets/image/default-group.png';
import { highLightKeyword } from '@/utils/highLightKeyword';
import './index.less';

interface SearchGroupChatProps {
  roomInfo: SearchContractsRoomInfo;
  dispatch(action: Action): void;
}

export function SearchGroupCard({ roomInfo, dispatch }: SearchGroupChatProps) {
  const { room_avatar, room_id, room_name, member_username } = roomInfo;

  function handleClick() {
    const selectSession: SelectSession = {
      type: 'room',
      sessionId: room_id,
      name: room_name,
    };

    dispatch({
      type: SELECT_SESSION,
      payload: selectSession,
    });
  }

  // 格式化搜索到的群成员用户名
  function formatMembersUsername() {
    return '';
  }

  return (
    <div className="search-group-card" onClick={handleClick}>
      <Avatar className="search-group-card__avatar" src={room_avatar || defaultGroup} />
      <div className="search-group-card__info">
        <div className="search-group-card__info__name">{room_name}</div>
        <div className="search-group-card__info__members">{formatMembersUsername()}</div>
      </div>
    </div>
  );
}

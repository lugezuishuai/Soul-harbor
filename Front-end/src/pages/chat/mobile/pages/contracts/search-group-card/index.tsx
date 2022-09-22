import { SearchContractsRoomInfo } from '@/interface/chat/searchContracts';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { SelectSession } from '@/redux/reducers/state';
import React from 'react';
import { Action } from '@/redux/actions';
import { Avatar } from 'antd';
import defaultGroup from '@/assets/image/default-group.png';
import { useHistory } from 'react-router-dom';
import { highlightKeyword } from '@/utils/highlightKeyword';
import './index.less';

interface SearchGroupChatProps {
  roomInfo: SearchContractsRoomInfo;
  keyword: string;
  dispatch(action: Action): void;
}

export function SearchGroupCard({ roomInfo, keyword, dispatch }: SearchGroupChatProps) {
  const history = useHistory();
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
    history.push(`/soul-harbor/chat/conversation/${selectSession.sessionId}`);
  }

  return (
    <div className="search-group-card" onClick={handleClick}>
      <Avatar className="search-group-card__avatar" src={room_avatar || defaultGroup} />
      <div className="search-group-card__info">
        <div className="search-group-card__info__text">{room_name}</div>
        <div className="search-group-card__info__text">{`包含：${highlightKeyword(
          member_username.join(', '),
          keyword,
        )}`}</div>
      </div>
    </div>
  );
}

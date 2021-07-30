import React from 'react';
import { Avatar } from 'antd';
import defaultGroup from '@/assets/image/default-group.png';
import { SelectSession } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { RoomInfo } from '@/interface/chat/getGroupsList';
import './index.less';

interface RoomCardProps {
  roomInfo: RoomInfo;
  dispatch(action: Action): void;
}

export function RoomCard({ roomInfo, dispatch }: RoomCardProps) {
  const { room_id, room_name, room_avatar } = roomInfo;

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

  return (
    <div className="chat-room-card" onClick={handleClick}>
      <Avatar className="chat-room-card-avatar" src={room_avatar || defaultGroup} />
      <div className="chat-room-card-name">{room_name}</div>
    </div>
  );
}

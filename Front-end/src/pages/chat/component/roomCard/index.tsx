import React from 'react';
import { Avatar } from 'antd';
import defaultGroup from '@/assets/image/default-group.png';
import { SelectSession, SelectSessionState } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { RoomInfo } from '@/interface/chat/getGroupsList';
import { screen } from '@/constants/screen';
import { useHistory } from 'react-router-dom';
import './index.less';

const { isMobile } = screen;

interface RoomCardProps {
  roomInfo: RoomInfo;
  dispatch(action: Action): void;
  selectSession: SelectSessionState;
}

export function RoomCard({ roomInfo, dispatch, selectSession }: RoomCardProps) {
  const history = useHistory();
  const { room_id, room_name, room_avatar } = roomInfo;

  function handleClick() {
    if (selectSession) {
      const { sessionId } = selectSession;
      if (room_id === sessionId) {
        isMobile && history.push(`/soul-harbor/chat/conversation/${sessionId}`);
        return;
      }
    }

    const newSelectSession: SelectSession = {
      type: 'room',
      sessionId: room_id,
      name: room_name,
    };

    dispatch({
      type: SELECT_SESSION,
      payload: newSelectSession,
    });
    isMobile && history.push(`/soul-harbor/chat/conversation/${newSelectSession.sessionId}`);
  }

  return (
    <div className="chat-room-card" onClick={handleClick}>
      <Avatar className="chat-room-card-avatar" src={room_avatar || defaultGroup} />
      <div className="chat-room-card-name">{room_name}</div>
    </div>
  );
}

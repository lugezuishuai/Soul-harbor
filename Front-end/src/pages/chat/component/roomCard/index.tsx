import React from 'react';
import { Skeleton } from '@/components/skeleton';
import classnames from 'classnames';
import { Avatar } from 'antd';
import defaultGroup from '@/assets/image/default-group.png';
import { SelectSession } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { SELECT_SESSION } from '@/redux/actions/action_types';
import { RoomInfo } from '@/interface/chat/getGroupsList';
import { useHistory } from 'react-router-dom';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

interface RoomCardProps {
  roomInfo: RoomInfo;
  dispatch(action: Action): void;
}

export function RoomCard({ roomInfo, dispatch }: RoomCardProps) {
  const history = useHistory();
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

    history.push(`/chat/${room_id}`);
  }

  return (
    <div className="chat-room-card" onClick={handleClick}>
      <Avatar className="chat-room-card-avatar" src={room_avatar || defaultGroup} />
      <div className="chat-room-card-name">{room_name}</div>
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'chat-room-card-skeleton')}>
      <AvatarSkeleton className="chat-room-card-skeleton-avatar" />
      <Block className="chat-room-card-skeleton-text" />
    </Skeleton>
  );
}

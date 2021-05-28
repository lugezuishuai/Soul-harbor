import React from 'react';
import { Skeleton } from '@/components/skeleton';
import classnames from 'classnames';
import { Avatar } from 'antd';
import defaultAvatar from '@/assets/image/default-avatar.png';
import defaultGroup from '@/assets/image/default-group.png';
import { SessionInfo } from '@/interface/chat/getSessionsList';
import { Action } from '@/redux/actions';
import { SelectSession } from '@/redux/reducers/state';
import { ACTIVE_SESSION, SELECT_SESSION } from '@/redux/actions/action_types';
import robotAvatar from '@/assets/image/robot.png';
import dayjs from 'dayjs';
import { ActiveSessionPayload } from '../../chatPage';
import { useHistory } from 'react-router-dom';
import './index.less';

const { Block, Avatar: AvatarSkeleton } = Skeleton;

interface SessionCardProps {
  sessionInfo: SessionInfo;
  activeSession: string[];
  dispatch(action: Action): void;
}

export function SessionCard({ sessionInfo, activeSession, dispatch }: SessionCardProps) {
  const history = useHistory();
  const { sessionId, name, avatar, latestTime, latestMessage, type } = sessionInfo;
  const isActiveSession = activeSession.includes(sessionId);

  function handleClick() {
    const selectSession: SelectSession = {
      type,
      sessionId,
      name,
    };

    const payload: ActiveSessionPayload = {
      type: 'delete',
      value: sessionId,
    };

    dispatch({
      type: ACTIVE_SESSION,
      payload,
    });

    dispatch({
      type: SELECT_SESSION,
      payload: selectSession,
    });

    history.push(`/chat/${sessionId}`);
  }

  function getAvatar() {
    if (type === 'private') {
      return sessionId !== '0' ? avatar || defaultAvatar : robotAvatar;
    } else {
      return avatar || defaultGroup;
    }
  }

  return (
    <div className="chat-session-card" onClick={handleClick}>
      {isActiveSession && <div className="chat-session-card__active" />}
      <Avatar className="chat-session-card-avatar" src={getAvatar()} />
      <div className="chat-session-card-info">
        <div className="chat-session-card-info__top">
          <div className="chat-session-card-info-name">{name}</div>
          <div className="chat-session-card-info-time">{dayjs(latestTime * 1000).format('hh:mm')}</div>
        </div>
        <div className="chat-session-card-info-msg">{latestMessage}</div>
      </div>
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'chat-session-card-skeleton')}>
      <AvatarSkeleton className="chat-session-card-skeleton-avatar" />
      <div className="chat-session-card-skeleton-info">
        <div className="chat-session-card-skeleton-info__top">
          <Block className="chat-session-card-skeleton-info-name" />
          <Block className="chat-session-card-skeleton-info-time" />
        </div>
        <Block className="chat-session-card-skeleton-info-msg" />
      </div>
    </Skeleton>
  );
}

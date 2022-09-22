import { MsgInfo } from '@/interface/chat/getHistoryMsg';
import defaultAvatar from '@/assets/image/default-avatar.png';
import robotAvatar from '@/assets/image/robot.png';
import defaultGroup from '@/assets/image/default-group.png';
import { Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import { FriendListState, GroupsListState, SelectSession } from '@/redux/reducers/state';
import { ActiveSessionPayload } from '../../chatPage';
import { Action } from '@/redux/actions';
import { ACTIVE_MSG, ACTIVE_SESSION, SELECT_SESSION } from '@/redux/actions/action_types';
import { screen } from '@/constants/screen';
import './index.less';
import { useHistory } from 'react-router-dom';

const { isMobile } = screen;

interface ActiveMsgProps {
  msg: MsgInfo;
  friendsList: FriendListState;
  groupsList: GroupsListState;
  dispatch(action: Action): void;
}

export function ActiveMsg({ msg, friendsList, groupsList, dispatch }: ActiveMsgProps) {
  const history = useHistory();
  const [name, setName] = useState('');

  function handleClick() {
    const { sender_id, private_chat, receiver_id } = msg;
    const selectSession: SelectSession = {
      type: private_chat === 0 ? 'private' : 'room',
      sessionId: private_chat === 0 ? sender_id : receiver_id,
      name,
    };

    const payload: ActiveSessionPayload = {
      type: 'delete',
      value: selectSession.sessionId,
    };

    dispatch({
      type: ACTIVE_SESSION,
      payload,
    });
    dispatch({
      type: ACTIVE_MSG,
      payload: null,
    });
    dispatch({
      type: SELECT_SESSION,
      payload: selectSession,
    });
    isMobile && history.push(`/soul-harbor/chat/conversation/${selectSession.sessionId}`);
  }

  function getAvatar() {
    const { private_chat, sender_id, sender_avatar } = msg;
    if (private_chat === 0) {
      return sender_id !== '0' ? sender_avatar || defaultAvatar : robotAvatar;
    } else {
      return defaultGroup;
    }
  }

  useEffect(() => {
    const { private_chat, receiver_id, sender_id } = msg;
    if (private_chat === 0) {
      // 私聊
      const friendInfo = friendsList?.find((item) => item.friend_id === sender_id);

      if (friendInfo) {
        setName(friendInfo.friend_username);
      }
    } else {
      // 群聊
      const groupInfo = groupsList?.find((item) => item.room_id === receiver_id);

      if (groupInfo) {
        setName(groupInfo.room_name);
      }
    }
  }, [friendsList, groupsList, msg]);

  return (
    <div className="chat-page__msg" onClick={handleClick}>
      <Avatar src={getAvatar()} className="chat-page__msg-avatar" />
      <div className="chat-page__msg-info">
        <div className="chat-page__msg-info__item">{name}</div>
        <div className="chat-page__msg-info__item">{msg.message}</div>
      </div>
    </div>
  );
}

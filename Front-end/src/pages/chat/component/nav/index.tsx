import { ActiveMenuState, UserInfoState } from '@/redux/reducers/state';
import React, { useCallback } from 'react';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { Avatar, Icon } from 'antd';
import Chat from '@/assets/icon/chat.svg';
import ChatAct from '@/assets/icon/chat_act.svg';
import Friend from '@/assets/icon/friend.svg';
import FriendAct from '@/assets/icon/friend_act.svg';
import { Action } from '@/redux/actions';
import { CHANGE_ACTIVE_MENU } from '@/redux/actions/action_types';
import './index.less';

interface ChatNavProps {
  userInfo: UserInfoState;
  activeMenu: ActiveMenuState;
  unreadChatMsgCount: number;
  dispatch(action: Action): void;
}

export function ChatNav({ userInfo, activeMenu, unreadChatMsgCount, dispatch }: ChatNavProps) {
  const avatar = userInfo?.avatar || defaultAvatar;

  const handleChangeMenu = useCallback(
    (type: string) => {
      if (type !== activeMenu) {
        dispatch({
          type: CHANGE_ACTIVE_MENU,
          payload: type,
        });
      }
    },
    [dispatch, activeMenu]
  );

  return (
    <div className="chat-nav">
      <Avatar className="chat-nav-avatar" src={avatar} />
      {unreadChatMsgCount > 0 && (
        <div className="chat-nav-unread">{unreadChatMsgCount <= 99 ? unreadChatMsgCount.toString() : '99+'}</div>
      )}
      <Icon
        className="chat-nav-icon"
        component={activeMenu === 'sessions' ? (ChatAct as any) : (Chat as any)}
        onClick={() => handleChangeMenu('sessions')}
      />
      <Icon
        className="chat-nav-icon"
        component={activeMenu === 'contracts' ? (FriendAct as any) : (Friend as any)}
        onClick={() => handleChangeMenu('contracts')}
      />
    </div>
  );
}

import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import Plus from '@/assets/icon/plus.svg';
import AddFriends from '@/assets/icon/add-friends.svg';
import CreateGroupChat from '@/assets/icon/create-group-chat.svg';
import { Icon, Dropdown, Menu } from 'antd';
import { SessionsListState } from '@/redux/reducers/state';
import { SessionCardSkeletonMobile } from '../../components/session-card-skeleton';
import './index.less';
import { SessionCard } from '@/pages/chat/component/sessionCard';
import { Action } from '@/redux/actions';

interface ChatSessionsMobileProps {
  dispatch(action: Action): void;
  unreadChatMsgCount: number;
  sessionsLoading: boolean;
  sessionsList: SessionsListState;
  activeSession: string[];
}

export function ChatSessionsMobile({
  unreadChatMsgCount,
  sessionsList,
  sessionsLoading,
  activeSession,
  dispatch,
}: ChatSessionsMobileProps) {
  function handleCreateGroupChat() {
    console.log('发起群聊');
  }

  function renderSessionsList() {
    const array = new Array(10).fill(0);
    if (sessionsLoading) {
      return (
        <>
          {array.map((o, i) => (
            <SessionCardSkeletonMobile key={i} />
          ))}
        </>
      );
    } else if (sessionsList?.length) {
      return (
        <>
          {sessionsList.map((sessionInfo, index) => (
            <SessionCard key={index} sessionInfo={sessionInfo} activeSession={activeSession} dispatch={dispatch} />
          ))}
        </>
      );
    } else {
      return null;
    }
  }

  const menu = (
    <Menu className="chat-sessions__mobile__menu" selectable={false}>
      <Menu.Item key="addFriends">
        <Link to="/chat/addFriends">
          <Icon component={AddFriends as any} className="chat-sessions__mobile__menu__icon" />
          <span className="chat-sessions__mobile__menu__text">添加好友</span>
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="createGroupChat">
        <div onClick={handleCreateGroupChat}>
          <Icon component={CreateGroupChat as any} className="chat-sessions__mobile__menu__icon" />
          <span className="chat-sessions__mobile__menu__text">新建群聊</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="chat-sessions__mobile">
      <div className="chat-sessions__mobile__header">
        <div className="chat-sessions__mobile__header__text">
          聊天&nbsp;
          {unreadChatMsgCount > 0 && (
            <span>{`(${unreadChatMsgCount <= 99 ? unreadChatMsgCount.toString() : '99+'}})`}</span>
          )}
        </div>
        <Dropdown overlay={menu} trigger={['click']} className="chat-sessions__mobile__header__dropdown">
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            <Icon className="chat-sessions__mobile__header__icon" component={Plus as any} />
          </a>
        </Dropdown>
      </div>
      <div className="chat-sessions__mobile__content">{renderSessionsList()}</div>
    </div>
  );
}

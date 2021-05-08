import { Action } from '@/redux/actions';
import { ChatActiveMenuState, State, UserInfoState } from '@/redux/reducers/state';
import React from 'react';
import { connect } from 'react-redux';
import { ChatNav } from './component/nav';
import { NoSearchResult, WrapChatSearch } from './component/search';
import { useChat } from './state';
import './index.less';
import { UserCard } from './component/userCard';

interface ChatPageProps {
  dispatch(action: Action): void;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
}

function ChatPage(props: ChatPageProps) {
  const { userInfo, activeMenu, dispatch, isSearch } = props;
  const isChatMenu = activeMenu === 'chat' && !isSearch;
  const isFriendMenu = activeMenu === 'friend' && !isSearch;

  const { searchData } = useChat();

  function renderSearchPage() {
    if (!searchData) {
      return <div className="chat-page__left-search" />;
    } else if (!searchData.length) {
      return <NoSearchResult />;
    } else {
      return searchData.map((userData, index) => <UserCard key={index} userData={userData} />);
    }
  }

  return (
    <div className="chat-page">
      <ChatNav userInfo={userInfo} activeMenu={activeMenu} dispatch={dispatch} />
      <div className="chat-page__left">
        <WrapChatSearch isSearch={isSearch} dispatch={dispatch} />
        <div className="chat-page__left-container">
          {isChatMenu && <div className="chat-page__left-chat"></div>}
          {isFriendMenu && <div className="chat-page__left-friend"></div>}
          {isSearch && renderSearchPage()}
        </div>
      </div>
    </div>
  );
}

export const WrapChatPage = connect(({ user: { userInfo }, chat: { activeMenu, isSearch } }: State) => ({
  userInfo,
  activeMenu,
  isSearch,
}))(ChatPage);

import { Action } from '@/redux/actions';
import { ChatActiveMenuState, LoginState, State, UserInfoState } from '@/redux/reducers/state';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { ChatNav } from './component/nav';
import { NoSearchResult, WrapChatSearch } from './component/search';
import { SearchMemberInfo } from '@/interface/chat/searchMember';

interface ChatPageProps {
  dispatch(action: Action): void;
  login: LoginState;
  userInfo: UserInfoState;
  activeMenu: ChatActiveMenuState;
  isSearch: boolean;
}

function ChatPage(props: ChatPageProps) {
  const { login, userInfo, activeMenu, dispatch, isSearch } = props;
  const isChatMenu = activeMenu === 'chat' && !isSearch;
  const isFriendMenu = activeMenu === 'friend' && !isSearch;

  const [searchData, setSearchData] = useState<SearchMemberInfo[] | null>(null);

  function renderSearchPage() {
    if (!searchData) {
      return <div className="chat-page__left-search" />;
    } else if (!searchData.length) {
      return <NoSearchResult />;
    } else {
      // 这里要填充数据
      return <div />;
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

export const WrapChatPage = connect(({ user: { login, userInfo }, chat: { activeMenu, isSearch } }: State) => ({
  login,
  userInfo,
  activeMenu,
  isSearch,
}))(ChatPage);

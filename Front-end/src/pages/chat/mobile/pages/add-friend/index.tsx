import React, { useCallback } from 'react';
import { Icon } from 'antd';
import { Action } from '@/redux/actions';
import { useChat } from '@/pages/chat/state';
import { UserCardSkeletonMobile } from '../../components/user-card-skeleton';
import NoResult from '@/assets/icon/no-result.svg';
import { UserCard } from '@/pages/chat/component/userCard';
import { FriendListState, SocketState } from '@/redux/reducers/state';
import { WrapSearchMobile } from './search';
import { History } from 'history';
import './index.less';

export interface AddFriendsMobileProps {
  dispatch(action: Action): void;
  getFriendsList(): void;
  history: History;
  friendsList: FriendListState;
  socket: SocketState;
  username: string;
}

function NoSearchResultMobile() {
  return (
    <div className="no-search-result__mobile">
      <Icon className="no-search-result__mobile__icon" component={NoResult as any} />
      <div className="no-search-result__mobile__text">没有搜索到该用户</div>
    </div>
  );
}

export function AddFriendsMobile({
  dispatch,
  getFriendsList,
  friendsList,
  socket,
  username,
  history,
}: AddFriendsMobileProps) {
  const { searchData, searchLoading } = useChat();

  const renderSearchPage = useCallback(() => {
    if (searchLoading) {
      const array = new Array(10).fill(0);
      return (
        <>
          {array.map((o, i) => (
            <UserCardSkeletonMobile key={i} />
          ))}
        </>
      );
    } else if (!searchData) {
      return null;
    } else if (!searchData.membersInfo.length) {
      return <NoSearchResultMobile />;
    } else {
      return (
        <>
          {searchData.membersInfo.map((userData, index) => (
            <UserCard
              key={index}
              userData={userData}
              getFriendsList={getFriendsList}
              friendsList={friendsList}
              dispatch={dispatch}
              socket={socket}
              username={username}
              keyword={searchData.keyword}
            />
          ))}
        </>
      );
    }
  }, [dispatch, friendsList, getFriendsList, searchData, searchLoading, socket, username]);

  function handleGoBack() {
    history.goBack();
  }

  return (
    <div className="add-friends__mobile">
      <div className="add-friends__mobile__header">
        <Icon type="left" className="add-friends__mobile__header__back" onClick={handleGoBack} />
        <div className="add-friends__mobile__header__text">添加好友</div>
      </div>
      <WrapSearchMobile />
      <div className="add-friends__mobile__content">{renderSearchPage()}</div>
    </div>
  );
}

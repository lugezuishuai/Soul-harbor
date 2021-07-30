import { FriendInfo } from '@/interface/chat/getFriendsList';
import { FriendListState, UserInfoState } from '@/redux/reducers/state';
import { Icon } from 'antd';
import React from 'react';
import { History } from 'history';
import { LaunchGroupChatContent } from './content';
import { SelectMemberSkeleton } from './select-member';
import './index.less';

export interface FriendsListInfo extends FriendInfo {
  selected: boolean;
}

interface LaunchGroupChatProps {
  getGroupsList: () => Promise<any>;
  friendsList: FriendListState;
  userInfo: UserInfoState;
  history: History;
}

function LaunchGroupChatSkeleton() {
  const array = new Array(10).fill(0);
  return (
    <div className="launch-group-chat__skeleton">
      {array.map((o, i) => (
        <SelectMemberSkeleton key={i} />
      ))}
    </div>
  );
}

export function LaunchGroupChat({ friendsList, userInfo, getGroupsList, history }: LaunchGroupChatProps) {
  function handleGoBack() {
    history.goBack();
  }

  return (
    <div className="launch-group-chat">
      <div className="launch-group-chat__header">
        <Icon type="left" className="launch-group-chat__header__back" onClick={handleGoBack} />
        <div className="launch-group-chat__header__text">选择联系人</div>
      </div>
      {friendsList && userInfo ? (
        <LaunchGroupChatContent getGroupsList={getGroupsList} friendsList={friendsList} userInfo={userInfo} />
      ) : (
        <LaunchGroupChatSkeleton />
      )}
    </div>
  );
}

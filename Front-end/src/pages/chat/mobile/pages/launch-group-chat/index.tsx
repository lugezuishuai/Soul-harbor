import { FriendInfo } from '@/interface/chat/getFriendsList';
import { UserInfoState } from '@/redux/reducers/state';
import { Icon } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { History } from 'history';
import './index.less';

interface LaunchGroupChatProps {
  getGroupsList: () => Promise<any>;
  friendsList: FriendInfo[];
  userInfo: UserInfoState;
  history: History;
}

interface SelectMembersInfo {
  username: string;
  avatar: string;
  id: string;
}

export function LaunchGroupChat({ friendsList, userInfo, getGroupsList, history }: LaunchGroupChatProps) {
  const [selectMember, setSelectMember] = useState<SelectMembersInfo[]>([]); // 所勾选用户的信息
  const [showFriends, setShowFriends] = useState<FriendInfo[]>(friendsList); // 所展示的好友列表
  const [searchLoading, setSearchLoading] = useState(false);

  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  function handleGoBack() {
    history.goBack();
  }

  function handleSearch() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = ++count.current;
      
    }, 350) as any;
  }

  return (
    <div className="launch-group-chat">
      <div className="launch-group-chat__header">
        <Icon type="left" className="launch-group-chat__header__back" onClick={handleGoBack} />
        <div className="launch-group-chat__header__text">选择联系人</div>
      </div>
    </div>
  );
}

import { FriendInfo } from '@/interface/chat/getFriendsList';
import { FriendListState, UserInfoState } from '@/redux/reducers/state';
import { Button, Icon } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { History } from 'history';
import { WrapSearchMember } from './search-members';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { SelectMember } from './select-member';
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

export function LaunchGroupChat({ friendsList, userInfo, getGroupsList, history }: LaunchGroupChatProps) {
  const initialFriendsListInfo: FriendsListInfo[] | null = friendsList
    ? friendsList.map((item) => ({ ...item, selected: false }))
    : null;
  const [friendsListInfo, setFriendsListInfo] = useState<FriendsListInfo[] | null>(initialFriendsListInfo); // 好友信息
  const [showFriendsListInfo, setShowFriendsListInfo] = useState<FriendsListInfo[] | null>(initialFriendsListInfo); // 所展示的好友列表
  const [loading, setLoading] = useState(false);

  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  function handleGoBack() {
    history.goBack();
  }

  const handleSearch = useCallback(
    (keyword: string) => {
      if (!friendsListInfo?.length) {
        return;
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const current = ++count.current;
        try {
          const friends = await Promise.resolve(
            keyword
              ? friendsListInfo.filter((friendInfo) => friendInfo.friend_username.includes(keyword))
              : friendsListInfo
          );

          if (count.current === current) {
            setShowFriendsListInfo(friends || []);
          }
        } catch (e) {
          if (count.current === current) {
            setShowFriendsListInfo([]);
          }
        }
      }, 350) as any;
    },
    [friendsListInfo]
  );

  // 删除所选
  const handleDeleteOrSelect = useCallback(
    (id: string) => {
      if (!friendsListInfo?.length) {
        return;
      }
      const newFriendsListInfo = friendsListInfo.map((friendInfo) => {
        if (friendInfo.friend_id === id) {
          return { ...friendInfo, selected: !friendInfo.selected };
        } else {
          return friendInfo;
        }
      });
      setFriendsListInfo(newFriendsListInfo);

      if (showFriendsListInfo?.length) {
        const newShowFriendsListInfo = showFriendsListInfo.map((friendInfo) => {
          if (friendInfo.friend_id === id) {
            return { ...friendInfo, selected: !friendInfo.selected };
          } else {
            return friendInfo;
          }
        });
        setShowFriendsListInfo(newShowFriendsListInfo);
      }
    },
    [friendsListInfo, showFriendsListInfo]
  );

  function handleConfirm() {
    console.log('点击了确认');
  }

  return (
    <div className="launch-group-chat">
      <div className="launch-group-chat__header">
        <Icon type="left" className="launch-group-chat__header__back" onClick={handleGoBack} />
        <div className="launch-group-chat__header__text">选择联系人</div>
      </div>
      <WrapSearchMember handleSearch={handleSearch} />
      <div className="launch-group-chat__selected">
        <div className="launch-group-chat__selected__text">已选：</div>
        <div className="launch-group-chat__selected__container">
          <div className="launch-group-chat__selected__content">
            {friendsListInfo &&
              friendsListInfo
                .filter((friendInfo) => friendInfo.selected)
                .map((friendInfo) => {
                  const { friend_avatar, friend_id } = friendInfo;
                  return (
                    <img
                      key={friend_id}
                      className="launch-group-chat__selected__img"
                      src={friend_avatar || defaultAvatar}
                      alt=""
                      onClick={() => handleDeleteOrSelect(friend_id)}
                    />
                  );
                })}
          </div>
        </div>
      </div>
      <div className="launch-group-chat__list">
        {showFriendsListInfo &&
          showFriendsListInfo.map((friendInfo) => (
            <SelectMember
              key={friendInfo.friend_id}
              friendInfo={friendInfo}
              handleDeleteOrSelect={handleDeleteOrSelect}
            />
          ))}
      </div>
      <Button type="primary" className="launch-group-chat__confirm" onClick={handleConfirm}>
        确认
      </Button>
    </div>
  );
}

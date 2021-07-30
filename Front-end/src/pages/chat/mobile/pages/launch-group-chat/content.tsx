import { FriendInfo } from '@/interface/chat/getFriendsList';
import { UserInfo } from '@/interface/user/init';
import { Button, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { WrapSearchMember } from './search-members';
import { SelectMember } from './select-member';
import defaultAvatar from '@/assets/image/default-avatar.png';
import { FriendsListInfo } from '.';
import { debounce } from 'lodash';
import { MemberInfo, NewGroupChatReq } from '@/interface/chat/newGroupChat';
import Cookies from 'js-cookie';
import { apiPost } from '@/utils/request';
import { NEW_GROUP_CHAT } from '@/constants/urls';
import './index.less';

interface LaunchGroupChatContentProps {
  getGroupsList: () => Promise<any>;
  friendsList: FriendInfo[];
  userInfo: UserInfo;
}

export function LaunchGroupChatContent({ getGroupsList, friendsList, userInfo }: LaunchGroupChatContentProps) {
  const initialFriendsListInfo: FriendsListInfo[] = friendsList.length
    ? friendsList.map((item) => ({ ...item, selected: false }))
    : [];

  const [friendsListInfo, setFriendsListInfo] = useState(initialFriendsListInfo);
  const [showFriendsListInfo, setShowFriendsListInfo] = useState(initialFriendsListInfo);
  const [loading, setLoading] = useState(false);

  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  const handleSearch = useCallback(
    (keyword: string) => {
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
      const newFriendsListInfo = friendsListInfo.map((friendInfo) => {
        if (friendInfo.friend_id === id) {
          return { ...friendInfo, selected: !friendInfo.selected };
        } else {
          return friendInfo;
        }
      });
      setFriendsListInfo(newFriendsListInfo);

      const newShowFriendsListInfo = showFriendsListInfo.map((friendInfo) => {
        if (friendInfo.friend_id === id) {
          return { ...friendInfo, selected: !friendInfo.selected };
        } else {
          return friendInfo;
        }
      });
      setShowFriendsListInfo(newShowFriendsListInfo);
    },
    [friendsListInfo, showFriendsListInfo]
  );

  async function handleConfirm() {
    const selectedFriendsInfo = friendsListInfo.filter((friendInfo) => friendInfo.selected);
    if (selectedFriendsInfo.length < 2) {
      debounce(() => {
        message.destroy();
        message.error({
          content: '发起群聊至少要选择两名好友',
          key: 'build_group_chat_error',
          duration: 1,
        });
      }, 200)();
    } else {
      try {
        setLoading(true);
        const { username, avatar } = userInfo;
        const members: MemberInfo[] = [
          {
            member_id: Cookies.get('uuid') || '',
            member_avatar: avatar || null,
            member_username: username || '',
            member_role: 0, // 群主
          },
        ];

        selectedFriendsInfo.forEach((friendInfo) => {
          const { friend_id, friend_avatar, friend_username } = friendInfo;
          members.push({
            member_id: friend_id,
            member_username: friend_username,
            member_avatar: friend_avatar,
            member_role: 1, // 普通群成员
          });
        });

        const roomName = `${username}、${selectedFriendsInfo[0].friend_username}、${selectedFriendsInfo[1].friend_username}等人的群聊`;
        const reqData: NewGroupChatReq = {
          members,
          room_name: roomName,
        };

        await apiPost(NEW_GROUP_CHAT, reqData);
        message.success('创建群聊成功');
        await getGroupsList(); // 重新拉取一遍群组列表
        setLoading(false);

        // TODO: 直接跳转到聊天页面？
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  }

  return (
    <>
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
      <Button
        type="primary"
        className="launch-group-chat__confirm"
        onClick={handleConfirm}
        disabled={loading}
        loading={loading}
      >
        确认
      </Button>
    </>
  );
}

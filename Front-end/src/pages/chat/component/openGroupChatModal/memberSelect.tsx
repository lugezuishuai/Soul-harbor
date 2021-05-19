import { LarkSelect, LarkSelectOption } from '@/components/lark-select';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import React, { forwardRef, useRef, useState } from 'react';
import { Member } from '../member';
import './index.less';

interface MemberSelectProps {
  friendsList: FriendInfo[];
  value?: string[];
  onChange?: (ids: string[]) => void;
}

export const MemberSelect = forwardRef(function (props: MemberSelectProps, ref: any) {
  const { friendsList, onChange, value } = props;

  const [members, setMembers] = useState(friendsList);
  const timer = useRef(-1);
  // 给每次搜索增加标识
  const count = useRef(0);
  const options: LarkSelectOption[] = members.map((friendInfo) => {
    const { friend_avatar, friend_username, friend_id } = friendInfo;

    return {
      value: friend_id,
      label: <Member name={friend_username} avatar={friend_avatar} />,
    };
  });

  // 从好友列表中搜索用户
  function searchUserList(keyword: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const current = ++count.current;
      try {
        const newMembers = await Promise.resolve(
          keyword ? friendsList.filter((friendInfo) => friendInfo.friend_username.includes(keyword)) : friendsList
        );
        if (count.current === current) {
          setMembers(newMembers || []);
        }
      } catch (e) {
        if (count.current === current) {
          setMembers([]);
        }
      }
    }, 350) as any;
  }

  return (
    <LarkSelect
      className="group-chat-modal-form-select"
      showSearch
      showSuffix={false}
      options={options}
      value={value}
      // @ts-ignore
      onChange={(ids: string[]) => {
        setMembers(friendsList);
        onChange && onChange(ids);
      }}
      placeholder="请从好友中选择群聊用户"
      notFoundContent="未搜索到该好友，请确认后再输入"
      style={{ width: '100%' }}
      defaultOpen={false}
      filterOption={false}
      defaultActiveFirstOption={false}
      mode="multiple"
      onSearch={searchUserList}
      ref={ref}
    />
  );
});

import React, { useState, useCallback } from 'react';
import { Button, Drawer, Icon } from 'antd';
import Danger from '@/assets/icon/danger.svg';
import { FriendInfo } from '@/interface/chat/getFriendsList';
import { FriendListState, GroupsListState } from '@/redux/reducers/state';
import { FriendCard } from '@/pages/chat/component/friendCard';
import { RoomCard } from '@/pages/chat/component/roomCard';
import { Action } from '@/redux/actions';
import { ContractCardSkeletonMobile } from '../../components/contract-card-skeleton';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { px2rem } from '@/utils/px2rem';
import { SearchContracts } from './search-contracts';
import { FoldingPanel } from '@/components/folding-panel';
import './index.less';

interface ChatContractsMobileProps {
  friendsLoading: boolean;
  groupsLoading: boolean;
  friendsListFold: boolean;
  groupsListFold: boolean;
  friendsList: FriendListState;
  groupsList: GroupsListState;
  handleFriendsListFold(): void;
  handleGroupsListFold(): void;
  dispatch(action: Action): void;
  deleteFriend(id: string): Promise<void>;
}

export function ChatContractsMobile({
  friendsLoading,
  groupsLoading,
  friendsList,
  groupsList,
  friendsListFold,
  groupsListFold,
  handleFriendsListFold,
  handleGroupsListFold,
  dispatch,
  deleteFriend,
}: ChatContractsMobileProps) {
  const [visible, setVisible] = useState(false); // drawer显示与否
  const [deleteFriendInfo, setDeleteFriendInfo] = useState<FriendInfo | null>(null); // 要删除的好友信息
  const [loading, setLoading] = useState(false); // 「确定」按钮loading
  const [showSearchContracts, setShowSearchContracts] = useState(false); // 是否展示搜索联系人界面

  function handleCloseDrawer() {
    setVisible(false);
  }

  function handleShowSearchContracts() {
    setShowSearchContracts(true);
  }

  const handleHideSearchContracts = useCallback(() => {
    setShowSearchContracts(false);
  }, []);

  const handleShowDrawer = useCallback((friendInfo: FriendInfo) => {
    setVisible(true);
    setDeleteFriendInfo(friendInfo);
  }, []);

  function renderContractsList() {
    const robotInfo: FriendInfo = {
      friend_id: '0',
      friend_username: '机器人小X',
      friend_avatar: null,
    };
    const newFriendsList = friendsList ? [robotInfo, ...friendsList] : [robotInfo];
    if (friendsLoading || groupsLoading) {
      const array = new Array(5).fill(0);
      return (
        <>
          <FoldingPanel handleFold={handleFriendsListFold} foldState={friendsListFold} textContent="好友" />
          {array.map((o, i) => (
            <ContractCardSkeletonMobile key={i} />
          ))}
          <FoldingPanel handleFold={handleGroupsListFold} foldState={groupsListFold} textContent="群组" />
          {array.map((o, i) => (
            <ContractCardSkeletonMobile key={i} />
          ))}
        </>
      );
    } else {
      return (
        <>
          <FoldingPanel handleFold={handleFriendsListFold} foldState={friendsListFold} textContent="好友" />
          {!friendsListFold &&
            newFriendsList.map((friendInfo) => (
              <FriendCard
                key={friendInfo.friend_id}
                handleShowDrawer={handleShowDrawer}
                friendInfo={friendInfo}
                dispatch={dispatch}
                deleteFriend={deleteFriend}
              />
            ))}
          <FoldingPanel handleFold={handleGroupsListFold} foldState={groupsListFold} textContent="群组" />
          {!groupsListFold &&
            groupsList &&
            groupsList.map((groupInfo) => (
              <RoomCard key={groupInfo.room_id} roomInfo={groupInfo} dispatch={dispatch} />
            ))}
        </>
      );
    }
  }

  async function handleConfirm() {
    if (!deleteFriendInfo) {
      return;
    }

    try {
      setLoading(true);
      await deleteFriend(deleteFriendInfo.friend_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setVisible(false);
    }
  }

  return (
    <div className="chat-contracts__mobile">
      <div className="chat-contracts__mobile__header">
        <div className="chat-contracts__mobile__header__text">联系人</div>
        <Icon className="chat-contracts__mobile__header__icon" type="search" onClick={handleShowSearchContracts} />
      </div>
      <div className="chat-contracts__mobile__content">{renderContractsList()}</div>
      <Drawer
        className="chat-contracts__mobile__alarm"
        placement="bottom"
        closable={false}
        onClose={handleCloseDrawer}
        visible={visible && !isNullOrUndefined(deleteFriendInfo)}
        height={px2rem(180)}
        getContainer={document.getElementsByClassName('home__container')[0] as HTMLElement}
      >
        <div className="chat-contracts__mobile__alarm__warn">
          <Icon component={Danger as any} className="chat-contracts__mobile__alarm__icon" />
          <div className="chat-contracts__mobile__alarm__text">{`您确定要删除您的好友 ${
            deleteFriendInfo?.friend_username || ''
          } 吗？`}</div>
        </div>
        <Button
          type="danger"
          className="chat-contracts__mobile__alarm__btn"
          loading={loading}
          disabled={loading}
          onClick={handleConfirm}
        >
          确认
        </Button>
        <Button className="chat-contracts__mobile__alarm__btn" onClick={handleCloseDrawer}>
          取消
        </Button>
      </Drawer>
      <Drawer
        className="chat-contracts__mobile__search"
        placement="right"
        closable={false}
        onClose={handleHideSearchContracts}
        visible={showSearchContracts && !isNullOrUndefined(friendsList) && !isNullOrUndefined(groupsList)}
        width={window.innerWidth}
        getContainer={document.getElementsByClassName('home__container')[0] as HTMLElement}
      >
        <SearchContracts handleHideSearchContracts={handleHideSearchContracts} dispatch={dispatch} />
      </Drawer>
    </div>
  );
}

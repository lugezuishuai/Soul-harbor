import { SEARCH_CONTRACTS } from '@/constants/urls';
import { SearchContractsData, SearchContractsRes } from '@/interface/chat/searchContracts';
import { apiGet } from '@/utils/request';
import { Icon } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { WrapSearchContractsForm } from './search';
import { FoldingPanel } from '@/components/folding-panel';
import { FriendCard } from '@/pages/chat/component/friendCard';
import { Action } from '@/redux/actions';
import { SearchGroupCard } from '../search-group-card';
import './index.less';

interface SearchContractsProps {
  handleHideSearchContracts(): void;
  dispatch(action: Action): void;
}

export function SearchContracts({ handleHideSearchContracts, dispatch }: SearchContractsProps) {
  const [contractsData, setContractsData] = useState<SearchContractsData | null>(null); // 搜索的联系人信息
  const [friendsTabFold, setFriendsTabFold] = useState(false); // 「好友」tab折叠
  const [groupsTabFold, setGroupsTabFold] = useState(false); // 「群组」tab折叠
  const timer = useRef(-1);

  const handleSearch = useCallback((keyword: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const { data }: SearchContractsRes = await apiGet(SEARCH_CONTRACTS, { keyword });
        setContractsData(data);
      } catch (e) {
        setContractsData(null);
        console.error(e);
      }
    }, 350) as any;
  }, []);

  function handleFriendsFold() {
    setFriendsTabFold((friendsTabFold) => !friendsTabFold);
  }

  function handleGroupsFold() {
    setGroupsTabFold((groupsTabFold) => !groupsTabFold);
  }

  return (
    <div className="search-contracts">
      <div className="search-contracts__header">
        <WrapSearchContractsForm handleSearch={handleSearch} />
        <Icon type="menu-unfold" className="search-contracts__header__unfold" onClick={handleHideSearchContracts} />
      </div>
      <div className="search-contracts__content">
        {contractsData && (
          <>
            <FoldingPanel handleFold={handleFriendsFold} foldState={friendsTabFold} textContent="好友" />
            {!friendsTabFold &&
              contractsData.friends.map((friendInfo) => (
                <FriendCard
                  key={friendInfo.friend_id}
                  friendInfo={friendInfo}
                  dispatch={dispatch}
                  needHightLight={true}
                  showDelete={false}
                  keyword={contractsData.keyword}
                />
              ))}
            <FoldingPanel handleFold={handleGroupsFold} foldState={groupsTabFold} textContent="群组" />
            {!groupsTabFold &&
              contractsData.rooms.map((roomInfo) => (
                <SearchGroupCard
                  key={roomInfo.room_id}
                  roomInfo={roomInfo}
                  keyword={contractsData.keyword}
                  dispatch={dispatch}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}

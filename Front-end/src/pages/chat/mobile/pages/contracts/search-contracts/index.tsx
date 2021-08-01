import { SEARCH_CONTRACTS } from '@/constants/urls';
import { SearchContractsData, SearchContractsRes } from '@/interface/chat/searchContracts';
import { apiPost } from '@/utils/request';
import { Icon } from 'antd';
import React, { useCallback, useState } from 'react';
import { WrapSearchContractsForm } from './search';
import './index.less';

interface SearchContractsProps {
  handleHideSearchContracts(): void;
}

export function SearchContracts({ handleHideSearchContracts }: SearchContractsProps) {
  const [contractsData, setContractsData] = useState<SearchContractsData | null>(null); // 搜索的联系人信息
  const [friendsTabFold, setFriendsTabFold] = useState(false); // 「好友」tab折叠
  const [groupsTabFold, setGroupsTabFold] = useState(false); // 「群组」tab折叠

  const handleSearch = useCallback(async (keyword: string) => {
    try {
      const { data }: SearchContractsRes = await apiPost(SEARCH_CONTRACTS, { keyword });
      setContractsData(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 高亮处理搜索关键字
  function hightLightKeyword(keyword: string, value: string) {
    if (!keyword) {
      return value;
    }

    const regExp = new RegExp(keyword, 'g');
    return value.replace(regExp, `<span className="chat-contracts__mobile__hightLight">${keyword}</span>`);
  }

  return (
    <div className="search-contracts">
      <div className="search-contracts__header">
        <WrapSearchContractsForm handleSearch={handleSearch} />
        <Icon type="menu-unfold" className="search-contracts__header__unfold" onClick={handleHideSearchContracts} />
      </div>
    </div>
  );
}

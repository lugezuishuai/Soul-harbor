// ChatPage的公共数据在此处维护
import { SEARCH_MEMBER } from '@/constants/urls';
import { SearchMemberInfo, SearchMemberRequest, SearchMemberRes } from '@/interface/chat/searchMember';
import { apiGet } from '@/utils/request';
import { useCallback, useRef, useState } from 'react';
import { createContainer, useContainer } from 'unstated-next';

function useCommonData() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchMemberInfo[] | null>(null);
  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  // 搜索相关数据
  const handleSearch = useCallback((value: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const current = ++count.current;
      try {
        setSearchLoading(true);
        const reqData: SearchMemberRequest = {
          search: value,
        };
        const { data }: SearchMemberRes = await apiGet(SEARCH_MEMBER, reqData);
        setSearchData(data);
        if (count.current === current) {
          setSearchLoading(false);
        }
      } catch (e) {
        setSearchData(null);
        if (count.current === current) {
          setSearchLoading(false);
        }
      }
    }, 350) as any;
  }, []);

  return {
    searchLoading,
    searchData,
    setSearchData,
    handleSearch,
  };
}

const container = createContainer(useCommonData);

export const ChatProvider = container.Provider;
export function useChat() {
  return useContainer(container);
}

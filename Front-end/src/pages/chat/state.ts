// ChatPage的公共数据在此处维护
import { SEARCH_MEMBER } from '@/constants/urls';
import { SearchMemberInfo, SearchMemberRequest, SearchMemberRes } from '@/interface/chat/searchMember';
import { apiGet } from '@/utils/request';
import { useCallback, useRef, useState } from 'react';
import { createContainer, useContainer } from 'unstated-next';

function useCommonData() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchMemberInfo[] | null>(null);
  const [selectUser, setSelectUser] = useState<SearchMemberInfo | null>(null); // 选中的用户
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

  // // 设置选中的用户
  // const handleSelectUser = useCallback(
  //   (uid: string) => {
  //     if (!uid || !searchData || !searchData.length) {
  //       return;
  //     }

  //     const user = searchData.find(({ userInfo }) => uid === userInfo?.uid);
  //     user?.online && setSelectUser(user);
  //     return user?.online;
  //   },
  //   [searchData]
  // );

  return {
    searchLoading,
    searchData,
    selectUser,
    setSearchData,
    setSelectUser,
    // handleSelectUser,
    handleSearch,
  };
}

const container = createContainer(useCommonData);

export const ChatProvider = container.Provider;
export function useChat() {
  return useContainer(container);
}

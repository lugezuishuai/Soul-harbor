// ChatPage的公共数据在此处维护
import { SEARCH_MEMBER } from '@/constants/urls';
import { MsgInfo } from '@/interface/chat/getHistoryMsg';
import { MemberInfo } from '@/interface/chat/newGroupChat';
import { SearchMemberInfoData, SearchMemberRequest, SearchMemberRes } from '@/interface/chat/searchMember';
import { SelectSession } from '@/redux/reducers/state';
import { apiGet } from '@/utils/request';
import Cookies from 'js-cookie';
import { useCallback, useRef, useState } from 'react';
import { createContainer, useContainer } from 'unstated-next';

function useCommonData() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchMemberInfoData | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false); // 获取好友列表loading
  const [groupsLoading, setGroupsLoading] = useState(false); // 获取群组列表loading
  const [sessionsLoading, setSessionsLoading] = useState(false); // 获取会话列表loading
  const [sessionMsg, setSessionMsg] = useState<MsgInfo | null>(null); // 会话接收到的信息
  const [readMessage, setReadMessage] = useState<MsgInfo[]>([]); // 已读信息
  const [unreadMessage, setUnreadMessage] = useState<MsgInfo[]>([]); // 未读信息
  const [membersList, setMembersList] = useState<MemberInfo[]>([]); // 群成员列表
  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  // 搜索相关数据
  const handleSearch = useCallback((keyword: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const current = ++count.current;
      try {
        setSearchLoading(true);
        const reqData: SearchMemberRequest = {
          keyword,
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

  // 获取自己的权限
  const getRole = useCallback(() => {
    if (!membersList) {
      return;
    }
    const ownInfo = membersList.find((memberInfo) => Cookies.get('uuid') === memberInfo.member_id);
    if (ownInfo) {
      return ownInfo.member_role;
    }
  }, [membersList]);

  // 设置已读未读信息
  const calculateHisMsg = useCallback((message: MsgInfo[], selectSession: SelectSession) => {
    const readHisMsg: MsgInfo[] = [],
      unreadHisMsg: MsgInfo[] = [];
    for (const msg of message) {
      if (msg.type === 'online') {
        readHisMsg.push(msg);
      } else if (msg.receiver_id === selectSession.sessionId) {
        // 自己发送给别人别人未读对于自己也是已读信息
        readHisMsg.push(msg);
      } else {
        unreadHisMsg.push(msg);
      }
    }

    setReadMessage(readHisMsg);
    setUnreadMessage(unreadHisMsg);
  }, []);

  // 拼接接收到的信息
  const receiveMsg = useCallback(() => {
    if (sessionMsg) {
      const newReadMsg = [...readMessage, sessionMsg];
      setReadMessage(newReadMsg);
      setSessionMsg(null); // 清空sessionMsg
    }
  }, [readMessage, sessionMsg, setSessionMsg]);

  return {
    searchLoading,
    friendsLoading,
    groupsLoading,
    sessionsLoading,
    searchData,
    sessionMsg,
    setSearchData,
    setFriendsLoading,
    setGroupsLoading,
    setSessionsLoading,
    setSessionMsg,
    handleSearch,
    readMessage,
    setReadMessage,
    unreadMessage,
    setUnreadMessage,
    membersList,
    setMembersList,
    getRole,
    calculateHisMsg,
    receiveMsg,
  };
}

const container = createContainer(useCommonData);

export const ChatProvider = container.Provider;
export function useChat() {
  return useContainer(container);
}

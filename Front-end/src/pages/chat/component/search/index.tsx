import React, { useCallback, useRef, useState } from 'react';
import { Icon, Input } from 'antd';
import NoResult from '@/assets/icon/no-result.svg';
import { Action } from '@/redux/actions';
import { IS_SEARCH } from '@/redux/actions/action_types';
import './index.less';

interface ChatSearchProps {
  isSearch: boolean;
  dispatch(action: Action): void;
}

export function NoSearchResult() {
  return (
    <div className="chat-search-no-result">
      <Icon className="chat-search-no-result-icon" component={NoResult as any} />
      <div className="chat-search-no-result-text">没有搜索到相关信息</div>
    </div>
  );
}

export function ChatSearch({ dispatch, isSearch }: ChatSearchProps) {
  const [loading, setLoading] = useState(false);
  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  const handleFocus = useCallback(() => {
    if (!isSearch) {
      dispatch({
        type: IS_SEARCH,
        payload: true,
      });
    }
  }, [dispatch, isSearch]);

  const handleBlur = useCallback(() => {
    if (isSearch) {
      dispatch({
        type: IS_SEARCH,
        payload: false,
      });
    }
  }, [dispatch, isSearch]);

  function handleChange(e: any) {
    if (e?.target?.value) {
      console.log('value: ', e.target.value);
    }
  }

  return (
    <div className="chat-search">
      <Input
        className="chat-search-input"
        placeholder="请输入用户名和邮箱"
        allowClear={true}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
}

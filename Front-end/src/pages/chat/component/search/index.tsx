import React, { useCallback, useRef, useState } from 'react';
import { Icon, Input, Form } from 'antd';
import NoResult from '@/assets/icon/no-result.svg';
import Search from '@/assets/icon/search.svg';
import { Action } from '@/redux/actions';
import { IS_SEARCH } from '@/redux/actions/action_types';
import { apiGet } from '@/utils/request';
import { SEARCH_MEMBER } from '@/constants/urls';
import { SearchMemberRequest } from '@/interface/chat/searchMember';
import { FormComponentProps } from 'antd/lib/form';
import './index.less';

interface ChatSearchProps extends FormComponentProps {
  isSearch: boolean;
  dispatch(action: Action): void;
}

export function NoSearchResult() {
  return (
    <div className="chat-search-no-result">
      <div className="chat-search-no-result__content">
        <Icon className="chat-search-no-result-icon" component={NoResult as any} />
        <div className="chat-search-no-result-text">没有搜索到相关信息</div>
      </div>
    </div>
  );
}

function ChatSearch({ dispatch, isSearch, form }: ChatSearchProps) {
  const { getFieldDecorator, resetFields } = form;
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>();
  const timer = useRef(-1);
  // 给每次请求增加标识
  const count = useRef(0);

  const handleFocus = useCallback(() => {
    if (isSearch) {
      resetFields(['input']);
      if (ref.current) {
        ref.current.blur();
      }
    }
    dispatch({
      type: IS_SEARCH,
      payload: !isSearch,
    });
  }, [dispatch, isSearch]);

  function handleChange(e: any) {
    if (e?.target?.value) {
      const search = e.target.value;
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const current = ++count.current;
        try {
          setLoading(true);
          const searchData: SearchMemberRequest = {
            search,
          };
          const { data } = await apiGet(SEARCH_MEMBER, searchData);
          if (count.current === current) {
            setLoading(false);
          }
        } catch (e) {
          if (count.current === current) {
            setLoading(false);
          }
        }
      }, 350) as any;
    }
  }

  return (
    <div className="chat-search">
      <Form>
        <Form.Item>
          {getFieldDecorator('input')(
            <Input
              ref={ref as any}
              prefix={<Icon component={Search as any} className="chat-search-icon" />}
              className="chat-search-input"
              placeholder="请输入用户名和邮箱"
              allowClear={true}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleFocus}
            />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export const WrapChatSearch = Form.create<ChatSearchProps>({
  name: 'chat-search',
})(ChatSearch);

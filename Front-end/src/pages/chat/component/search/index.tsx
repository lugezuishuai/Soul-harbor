import React, { useCallback, useEffect, useRef } from 'react';
import { Icon, Input, Form } from 'antd';
import NoResult from '@/assets/icon/no-result.svg';
import Search from '@/assets/icon/search.svg';
import { Action } from '@/redux/actions';
import { IS_SEARCH } from '@/redux/actions/action_types';
import { FormComponentProps } from 'antd/lib/form';
import { useChat } from '../../state';
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
  const { handleSearch, setSearchData } = useChat();
  const ref = useRef<HTMLInputElement>();

  function handleFocus() {
    setTimeout(() => {
      if (isSearch) {
        resetFields(['input']);
        setSearchData(null);
        if (ref.current) {
          ref.current.blur();
        }
      }
      dispatch({
        type: IS_SEARCH,
        payload: !isSearch,
      });
    }, 100);
  }

  const handleChange = useCallback(
    (e: any) => {
      if (e?.target?.value) {
        const search = e.target.value;
        handleSearch(search);
      }
    },
    [handleSearch]
  );

  useEffect(() => {
    console.log('组件挂载了');

    return () => console.log('组件卸载了');
  }, []);

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

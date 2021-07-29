import React from 'react';
import { Form, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Search from '@/assets/icon/search.svg';
import './index.less';

interface SearchMemberProps extends FormComponentProps {
  handleSearch(keyword: string): void;
}

function SearchMember({ form, handleSearch }: SearchMemberProps) {
  const { getFieldDecorator } = form;

  function handleChange(e: any) {
    if (e?.target?.value) {
      const search = e.target.value;
      handleSearch(search);
    }
  }

  return (
    <div className="launch-group-chat__search">
      <Form className="launch-group-chat__search__form">
        <Form.Item>
          {getFieldDecorator('input')(
            <Input
              prefix={<Icon component={Search as any} className="launch-group-chat__search__icon" />}
              style={{ height: 32 }}
              placeholder="请输入您的好友的用户名"
              allowClear={true}
              onChange={handleChange}
            />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export const WrapSearchMember = Form.create<SearchMemberProps>({
  name: 'search-member',
})(SearchMember);

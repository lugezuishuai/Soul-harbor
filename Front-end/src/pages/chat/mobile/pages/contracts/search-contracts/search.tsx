import { Form, Input, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Search from '@/assets/icon/search.svg';
import React from 'react';
import './index.less';

interface SearchContractsFormProps extends FormComponentProps {
  handleSearch(keyword: string): void;
}

function SearchContractsForm({ handleSearch, form }: SearchContractsFormProps) {
  const { getFieldDecorator } = form;

  function handleChange(e: any) {
    if (e?.target?.value) {
      const keyword = e.target.value;
      handleSearch(keyword);
    }
  }

  return (
    <Form className="search-contracts__header__form">
      <Form.Item>
        {getFieldDecorator('input')(
          <Input
            prefix={
              <Icon component={Search as any} className="search-contracts__header__prefix" />
            }
            style={{ height: 32 }}
            placeholder="请输入您的好友的用户名"
            allowClear={true}
            onChange={handleChange}
          />
        )}
      </Form.Item>
    </Form>
  );
}

export const WrapSearchContractsForm = Form.create<SearchContractsFormProps>({
  name: 'search-contracts-form',
})(SearchContractsForm);

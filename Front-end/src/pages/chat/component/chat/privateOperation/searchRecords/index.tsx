import { Icon, Input } from 'antd';
import Form, { FormComponentProps } from 'antd/lib/form';
import Search from '@/assets/icon/search.svg';
import React from 'react';
import './index.less';

interface SearchRecordsProps extends FormComponentProps {
  handleSearch(keyword: string): void;
}

function SearchRecords({ form, handleSearch }: SearchRecordsProps) {
  const { getFieldDecorator } = form;

  function handleChange(e: any) {
    if (e?.target?.value) {
      const keyword = e.target.value;
      handleSearch(keyword);
    }
  }

  return (
    <div className="search-records">
      <Form className="search-records__form">
        <Form.Item>
          {getFieldDecorator('input')(
            <Input
              prefix={<Icon component={Search as any} className="search-records__form__prefix" />}
              style={{ height: 32 }}
              placeholder="请输入你要搜索的内容"
              allowClear={true}
              onChange={handleChange}
            />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export const WrapSearchRecords = Form.create<SearchRecordsProps>({
  name: 'search-records',
})(SearchRecords);

import React, { useCallback } from 'react';
import { Form, Input, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Search from '@/assets/icon/search.svg';
import { useChat } from '@/pages/chat/state';
import './index.less';

function SearchMobile({ form }: FormComponentProps) {
  const { getFieldDecorator } = form;
  const { handleSearch } = useChat();

  const handleChange = useCallback(
    (e: any) => {
      if (e?.target?.value) {
        const search = e.target.value;
        handleSearch(search);
      }
    },
    [handleSearch]
  );

  return (
    <div className="add-friends__mobile__search">
      <Form className="add-friends__mobile__search__form">
        <Form.Item>
          {getFieldDecorator('input')(
            <Input
              prefix={<Icon component={Search as any} className="add-friends__mobile__search__icon" />}
              style={{ height: 32 }}
              placeholder="请输入用户名和邮箱"
              allowClear={true}
              onChange={handleChange}
            />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export const WrapSearchMobile = Form.create({
  name: 'search-mobile',
})(SearchMobile);

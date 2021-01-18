import React, { useState } from 'react';
import { Avatar, Icon, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less';

interface Props {
  handleMenuChange(obj: any): void;
}

function UserMenu(props: Props) {
  const { handleMenuChange } = props;
  const handleClickItem = () => {
    const obj = {
      key: 'user'
    };
    handleMenuChange(obj);
  }

  return (
    <Menu className={style.operation_menu} selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className={style.operation_menu_item}>
        <Link to="/user" className={style.menu_item_text}>个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" className={style.operation_menu_item}>
        <span className={style.menu_item_text}>修改密码</span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" className={style.operation_menu_item}>
        <span className={style.menu_item_text}>退出登录</span>
      </Menu.Item>
    </Menu>
  )
}

export default function UserInfo(props: Props) {
  const { handleMenuChange } = props;
  return (
    <div className={style.operation}>
      <Avatar size="large" icon="user" />
      <Dropdown overlay={<UserMenu handleMenuChange={handleMenuChange}/>} trigger={['hover']}>
        <a className="ant-dropdown-link" onClick={e => {
          e.preventDefault();
        }}>
          <Icon type="down" className={style.operation_icon}/>
        </a>
      </Dropdown>
    </div>
  )
}
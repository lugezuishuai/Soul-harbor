import React, { useState } from 'react';
import { Avatar, Icon, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import { screen } from '@/constants/screen';
import './index.less';

interface MenuProps {
  handleMenuChange(obj: any): void;
}

interface Props extends MenuProps {
  nickName: string;
  avatar: string;
}

function UserMenu(props: MenuProps) {
  const { handleMenuChange } = props;
  const handleClickItem = () => {
    const obj = {
      key: 'user'
    };
    handleMenuChange(obj);
  }

  return (
    <Menu className="user_operation_menu" selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className="user_operation_menu_item">
        <Link to="/user" className="user_operation_menu_item_text">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" className="user_operation_menu_item">
        <span className="user_operation_menu_item_text">修改密码</span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" className="user_operation_menu_item">
        <span className="user_operation_menu_item_text">退出登录</span>
      </Menu.Item>
    </Menu>
  )
}

export default function Operation(props: Props): any {
  const { handleMenuChange, nickName, avatar } = props;
  return (
    <div className="user_operation">
      <span className="user_operation_nick_name">{nickName}</span>
      <div className="user_operation_avatar">
        <Avatar size={screen.isLittleScreen ? 'small': 'large'} icon="user" src={avatar} style={{ border: '1px solid rgba(0, 0, 0, 0.35)' }}/>
        <Dropdown overlay={<UserMenu handleMenuChange={handleMenuChange}/>} trigger={screen.isLittleScreen ? ['click'] : ['hover']}>
          <a className="ant-dropdown-link" onClick={e => {
            e.preventDefault();
          }}>
            <Icon type="down" className="user_operation_avatar_icon"/>
          </a>
        </Dropdown>
      </div>
    </div>
  )
}
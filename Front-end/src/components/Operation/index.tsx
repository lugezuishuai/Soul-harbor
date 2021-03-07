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

export default function Operation(props: Props): any {
  const { handleMenuChange, nickName, avatar } = props;
  const handleClickItem = () => {
    const obj = {
      key: 'user'
    };
    handleMenuChange(obj);
  }

  const menu = (
    <Menu className="user_operation_menu" selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className="user_operation_menu_item">
        <Link to="/user" className="user_operation_menu_item_text">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text">修改密码</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text">退出登录</div>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="user_operation">
      <span className="user_operation_nick_name">{nickName}</span>
      <div className="user_operation_avatar">
        <Avatar className={screen.isLittleScreen ? "user_operation_avatar_img__small" : "user_operation_avatar_img"} icon="user" src={avatar}/>
        <Dropdown overlay={menu} trigger={screen.isLittleScreen ? ['click'] : ['hover']}>
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
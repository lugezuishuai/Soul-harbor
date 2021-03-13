import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { UserInfo } from '@/interface/user/login';
import { Action } from '@/redux/actions/index';
import BasicInfo from './basicInfo';
import AccountInfo from './accountInfo';
import './index.less';

interface Props {
  userInfo: UserInfo;
  userNameShow: boolean;
  userIdShow: boolean;
  dispatch(action: Action): void;
}

function UserInfo(props: Props) {
  const { userInfo, userIdShow, userNameShow, dispatch } = props;
  const { username, uid, ...basicInfo } = userInfo;

  const [edit, setEdit] = useState(false);                             // 基本信息编辑态
  const [showUserName, SetShowUserName] = useState(userNameShow);      // 是否显示用户名
  const [showUserId, setShowUserId] = useState(userIdShow);            // 是否显示用户ID
  
  useEffect(() => {
    dispatch({
      type: 'CHANGE_SHOW_USERNAME',
      payload: showUserName,
    });
    dispatch({
      type: 'CHANGE_SHOW_USERID',
      payload: showUserId,
    })
  }, [showUserId, showUserName])

  // BasicInfo 配置
  const handleEdit = (edit: boolean) => {
    setEdit(edit);
  }

  // AccountInfo 配置
  const handleShowUserName = () => SetShowUserName(!showUserName);
  const handleShowUserId = () => setShowUserId(!showUserId);

  return (
    <div className="user_info">
      <AccountInfo userName={username} userId={uid} showUserName={showUserName} showUserId={showUserId} handleShowUserName={handleShowUserName} handleShowUserId={handleShowUserId}/>
      <BasicInfo basicInfo={basicInfo} edit={edit} handleEdit={handleEdit}/>
    </div>
  )
}

export default connect((state: State) => ({
  userInfo: state.user.userInfo,
  userNameShow: state.user.userNameShow,
  userIdShow: state.user.userIdShow
}))(UserInfo);
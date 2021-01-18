import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { GetUserInfoResponse } from '@/interface/userInfo';
import { Action } from '@/redux/actions/index';
import BasicInfo from './basicInfo';
import AccountInfo from './accountInfo';
import style from './index.less';

interface Props {
  userInfo: GetUserInfoResponse;
  userNameShow: boolean;
  userIdShow: boolean;
  dispatch(action: Action): void;
}

function UserInfo(props: Props) {
  const { userInfo, userIdShow, userNameShow, dispatch } = props;
  const { userName, userId, ...basicInfo } = userInfo;

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
    <div className={style.user_info}>
      <AccountInfo userName={userName} userId={userId} showUserName={showUserName} showUserId={showUserId} handleShowUserName={handleShowUserName} handleShowUserId={handleShowUserId}/>
      <BasicInfo basicInfo={basicInfo} edit={edit} handleEdit={handleEdit}/>
    </div>
  )
}

export default connect((state: State) => ({
  userInfo: state.user.userInfo,
  userNameShow: state.user.userNameShow,
  userIdShow: state.user.userIdShow
}))(UserInfo);
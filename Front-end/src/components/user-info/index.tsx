import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { State } from '@/redux/reducers/state';
import { UserInfo } from '@/interface/user/login';
import { Action } from '@/redux/actions/index';
import BasicInfo from './basic-info';
import { WrapAccountInfo } from './account-info';
import './index.less';

interface UserInfoProps {
  userInfo: UserInfo | null;
  userNameShow: boolean;
  userIdShow: boolean;
  dispatch(action: Action): void;
}

function UserInfo(props: UserInfoProps) {
  const { userInfo, userIdShow, userNameShow, dispatch } = props;

  const [showUserName, setShowUserName] = useState(userNameShow); // 是否显示用户名
  const [showUserId, setShowUserId] = useState(userIdShow); // 是否显示用户ID

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SHOW_USERNAME',
      payload: showUserName,
    });
    dispatch({
      type: 'CHANGE_SHOW_USERID',
      payload: showUserId,
    });
  }, [showUserId, showUserName]);

  // AccountInfo 配置
  const handleShowUserName = () => setShowUserName(!showUserName);
  const handleShowUserId = () => setShowUserId(!showUserId);

  function renderUserInfo() {
    if (!userInfo) {
      return null;
    }
    const { username, uid, ...basicInfo } = userInfo;

    return (
      <>
        <WrapAccountInfo
          userName={username}
          userId={uid}
          showUserName={showUserName}
          showUserId={showUserId}
          handleShowUserName={handleShowUserName}
          handleShowUserId={handleShowUserId}
        />
        <BasicInfo basicInfo={basicInfo} />
      </>
    );
  }

  return <div className="user-info">{renderUserInfo()}</div>;
}

export default connect(({ user: { userInfo, userIdShow, userNameShow } }: State) => ({
  userInfo,
  userNameShow,
  userIdShow,
}))(UserInfo);

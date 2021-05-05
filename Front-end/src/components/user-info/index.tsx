import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { State, UserInfoState } from '@/redux/reducers/state';
import { UserInfo } from '@/interface/user/login';
import { Action } from '@/redux/actions/index';
import { BasicInfo } from './basic-info';
import { WrapAccountInfo } from './account-info';
import './index.less';

interface UserInfoProps {
  userInfo: UserInfoState;
  userNameShow: boolean;
  userIdShow: boolean;
  emailShow: boolean;
  dispatch(action: Action): void;
}

function UserInfo(props: UserInfoProps) {
  const { userInfo, userIdShow, emailShow, userNameShow, dispatch } = props;

  const [showUserName, setShowUserName] = useState(userNameShow); // 是否显示用户名
  const [showUserId, setShowUserId] = useState(userIdShow); // 是否显示用户ID
  const [showEmail, setShowEmail] = useState(emailShow); // 是否显示邮箱

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SHOW_USERNAME',
      payload: showUserName,
    });
    dispatch({
      type: 'CHANGE_SHOW_USERID',
      payload: showUserId,
    });
    dispatch({
      type: 'CHANGE_SHOW_EMAIL',
      payload: showEmail,
    });
  }, [showUserId, showUserName, showEmail]);

  // AccountInfo 配置
  const handleShowUserName = () => setShowUserName(!showUserName);
  const handleShowUserId = () => setShowUserId(!showUserId);
  const handleShowEmail = () => setShowEmail(!showEmail);

  function renderUserInfo() {
    if (!userInfo) {
      return null;
    }
    const { username, uid, email, ...basicInfo } = userInfo;

    return (
      <>
        <WrapAccountInfo
          userName={username || ''}
          userId={uid || ''}
          email={email || ''}
          showUserName={showUserName}
          showUserId={showUserId}
          showEmail={showEmail}
          handleShowUserName={handleShowUserName}
          handleShowUserId={handleShowUserId}
          handleShowEmail={handleShowEmail}
        />
        <BasicInfo basicInfo={basicInfo} userId={uid || ''} />
      </>
    );
  }

  return <div className="user-info">{renderUserInfo()}</div>;
}

export default connect(({ user: { userInfo, userIdShow, userNameShow, emailShow } }: State) => ({
  userInfo,
  userNameShow,
  userIdShow,
  emailShow,
}))(UserInfo);

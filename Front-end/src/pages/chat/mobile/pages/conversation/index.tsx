import { Drawer, Form, Icon } from 'antd';
import React, { useState } from 'react';
import { Action } from '@/redux/actions';
import { FriendListState, SelectSessionState, SocketState, UserInfoState } from '@/redux/reducers/state';
import { FormComponentProps } from 'antd/lib/form';
import ChatMenu from '@/assets/icon/chat-menu.svg';
import { useHistory } from 'react-router-dom';
import './index.less';

export interface ConversationMobileProps extends FormComponentProps {
  dispatch(action: Action): void;
  getGroupsList(): Promise<void>;
  getSessionsList(): Promise<void>;
  updateUnreadMsg(): Promise<void>;
  socket: SocketState;
  userInfo: UserInfoState;
  selectSession: SelectSessionState;
  friendsList: FriendListState;
}

function ConversationMobile({
  dispatch,
  getGroupsList,
  getSessionsList,
  updateUnreadMsg,
  socket,
  userInfo,
  selectSession,
  friendsList,
}: ConversationMobileProps) {
  const history = useHistory();
  const [visible, setVisible] = useState(false); // 控制右侧菜单的显示

  function handleGoBack() {
    history.goBack();
  }

  function handleClickMenu() {
    setVisible(!visible);
  }

  function handleCloseDrawer() {
    setVisible(false);
  }

  return (
    selectSession && (
      <div className="conversation-mobile">
        <div className="conversation-mobile__header">
          <Icon type="left" className="conversation-mobile__header__back" onClick={handleGoBack} />
          <div className="conversation-mobile__header__name">{selectSession.name}</div>
          <Icon component={ChatMenu as any} className="conversation-mobile__header__menu" onClick={handleClickMenu} />
        </div>
        <Drawer
          className="conversation-mobile__drawer"
          placement="right"
          closable={false}
          onClose={handleCloseDrawer}
          visible={visible}
          width={window.innerWidth}
          getContainer={document.getElementsByClassName('home__container')[0] as HTMLElement}
        >
          {selectSession.type === 'room' ? <div /> : <div />}
        </Drawer>
      </div>
    )
  );
}

export const WrapConversationMobile = Form.create<ConversationMobileProps>({
  name: 'conversation-mobile',
})(ConversationMobile);

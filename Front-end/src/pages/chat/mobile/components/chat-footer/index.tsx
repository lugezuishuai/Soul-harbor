import React from 'react';
import Session from '@/assets/icon/chat.svg';
import SessionAct from '@/assets/icon/chat_act.svg';
import Contract from '@/assets/icon/friend.svg';
import ContractAct from '@/assets/icon/friend_act.svg';
import { Action } from '@/redux/actions';
import { History, Location } from 'history';
import { Icon } from 'antd';
import { CHANGE_ACTIVE_MENU } from '@/redux/actions/action_types';
import classnames from 'classnames';
import { matchPath } from 'react-router-dom';
import './index.less';

interface ChatFooterMobileProps {
  dispatch(action: Action): void;
  activeMenu: string;
  history: History;
  location: Location;
}

export function ChatFooterMobile({ activeMenu, dispatch, history }: ChatFooterMobileProps) {
  const isSessionsMenu = matchPath(location.pathname, { path: '/chat/sessions', exact: true });

  function handleChangeMenu(type: string) {
    if (type !== activeMenu) {
      dispatch({
        type: CHANGE_ACTIVE_MENU,
        payload: type,
      });

      history.push(`/chat/${type}`);
    }
  }

  return (
    <div className="chat-footer__mobile">
      <div className="chat-footer__mobile__item" key="sessions">
        <Icon
          className="chat-footer__mobile__icon"
          component={isSessionsMenu ? (SessionAct as any) : (Session as any)}
          onClick={() => handleChangeMenu('sessions')}
        />
        <div className={classnames('chat-footer__mobile__text', { 'chat-footer__mobile__text__act': isSessionsMenu })}>
          聊天
        </div>
      </div>
      <div className="chat-footer__mobile__item" key="contracts">
        <Icon
          className="chat-footer__mobile__icon"
          component={!isSessionsMenu ? (ContractAct as any) : (Contract as any)}
          onClick={() => handleChangeMenu('contracts')}
        />
        <div className={classnames('chat-footer__mobile__text', { 'chat-footer__mobile__text__act': !isSessionsMenu })}>
          通讯录
        </div>
      </div>
    </div>
  );
}